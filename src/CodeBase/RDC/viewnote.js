loadViewNoteComponent = function () {
  if (MainApplication.cachedState.mode) {
    whenViewNoteDependeciesLoaded();
  } else {
    setTimeout(function () {
      MainApplication.cachedState.pageStateCall = loadViewNoteComponent;
    }, 1000);
  }
};

MainApplication.ViewNoteComponent.ApplicationDetails = function () {
  this.itemId = null;
  this.requestDetails = {};
};

function whenViewNoteDependeciesLoaded() {
  AppRequest = new MainApplication.ViewNoteComponent.ApplicationDetails();

  AppRequest.itemId = $spcontext.getParameterByName(
    "itemid",
    window.location.href
  );

  if (!AppRequest.itemId) {
    // also accept itemId casing
    AppRequest.itemId = $spcontext.getParameterByName(
      "itemId",
      window.location.href
    );
  }

  $("#vn-print-btn")
    .off("click.vnprint")
    .on("click.vnprint", function () {
      window.print();
    });

  if (!AppRequest.itemId) {
    globalDefinitions.closeLoader();
    MainApplication.notyf.error("No meeting note specified.");
    $spcontext.redirect("#/mynotes", false);
    return;
  }

  MainApplication.ViewNoteComponent.recoverListData();
}

/* ------------------------------------------------------------------ */
/* Load from list                                                      */
/* ------------------------------------------------------------------ */

MainApplication.ViewNoteComponent.recoverListData = function () {
  var listName = configProperties.MTNNOTELIST.setting;

  if (!listName || typeof listName !== "string") {
    console.warn("List name not ready, retrying…");
    setTimeout(MainApplication.ViewNoteComponent.recoverListData, 400);
    return;
  }

  var query = speedctxRoot.camlBuilder([
    { rowlimit: 1 },
    {
      operator: "Eq",
      field: "ReferenceID",
      type: "Text",
      val: AppRequest.itemId,
    },
  ]);

  var extraProperties = [
    "ID",
    "Title",
    "ReferenceID",
    "MeetingType",
    "MeetingCategory",
    "MeetingWeek",
    "MeetingDate",
    "RequiredTime",
    "Attendees",
    "TimeOff",
    "TimeKeeper",
    "Presenter",
    "EngagementParticipant",
    "AOB",
    "StartTime",
    "EndTime",
    "Absentees",
    "Agenda",
    "Discussion",
    "NumberOfTaskItems",
    "Modified",
    "Status",
    "Reporter",
    "Tasks",
  ];

  speedctxRoot.getListToControl(
    listName,
    query,
    extraProperties,
    function (listProperties) {
      if ($.isEmptyObject(listProperties)) {
        globalDefinitions.closeLoader();
        MainApplication.notyf.error("Meeting note not found.");
        $spcontext.redirect("#/mynotes", false);
        return;
      }

      AppRequest.requestDetails = listProperties;
      MainApplication.ViewNoteComponent.renderNote(listProperties);
      // Action items live in MeetingNoteTasks (not the JSON on the parent)
      MainApplication.ViewNoteComponent.loadMeetingTasks(
        listProperties.ReferenceID || AppRequest.itemId
      );

      $("#viewnote-page").removeClass("hidden");
      $("#newLoader").hide();
      globalDefinitions.closeLoader();
    },
    function (sender, args) {
      console.error(
        "ViewNote load failed",
        args && args.get_message && args.get_message()
      );
      globalDefinitions.closeLoader();
      MainApplication.notyf.error("Unable to load this meeting note.");
    }
  );
};

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

MainApplication.ViewNoteComponent.escapeHtml = function (value) {
  return String(value == null ? "" : value).replace(/[&<>"']/g, function (c) {
    return (
      {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      }[c] || c
    );
  });
};

MainApplication.ViewNoteComponent.parseJSON = function (value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === "object") return value;
  if (typeof value === "string") {
    try {
      return JSON.parse(value) || [];
    } catch (e) {
      return [];
    }
  }
  return [];
};

/** Normalise person field values to { name, email }[] */
MainApplication.ViewNoteComponent.normalisePeople = function (value) {
  var emails = [];
  if (typeof MainApplication.NewRequestComponent !== "undefined" &&
      typeof MainApplication.NewRequestComponent.normalizePeopleEmails === "function") {
    emails = MainApplication.NewRequestComponent.normalizePeopleEmails(value);
  } else if (typeof MainApplication.NewNoteComponent !== "undefined" &&
             typeof MainApplication.NewNoteComponent.normalizePeopleEmails === "function") {
    emails = MainApplication.NewNoteComponent.normalizePeopleEmails(value);
  } else {
    // lightweight fallback
    if (!value) emails = [];
    else if (typeof value === "string") {
      try {
        var parsed = JSON.parse(value);
        emails = Array.isArray(parsed) ? parsed : [value];
      } catch (e) {
        emails = [value];
      }
    } else if (Array.isArray(value)) {
      emails = value.map(function (v) {
        if (typeof v === "string") return v;
        return (v && (v.email || v.Email || v.get_email && v.get_email())) || "";
      }).filter(Boolean);
    } else if (typeof value === "object") {
      emails = [
        value.email || value.Email || (value.get_email && value.get_email()) || "",
      ].filter(Boolean);
    }
  }

  return emails.map(function (email) {
    var staff =
      MainApplication.staffDetails &&
      MainApplication.staffDetails[String(email).toLowerCase()];
    return {
      email: email,
      name: (staff && staff.Title) || email,
    };
  });
};

MainApplication.ViewNoteComponent.formatDate = function (raw) {
  if (!raw) return "—";
  try {
    if (typeof $spcontext.stringnifyDate === "function") {
      return $spcontext.stringnifyDate({
        value: raw,
        includeTime: false,
        format: "dd/mm/yy",
      });
    }
  } catch (e) {}
  // fallback ISO yyyy-mm-dd
  var s = String(raw);
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) {
    var p = s.substring(0, 10).split("-");
    return p[2] + "/" + p[1] + "/" + p[0];
  }
  return s;
};

/* ------------------------------------------------------------------ */
/* Render                                                              */
/* ------------------------------------------------------------------ */

MainApplication.ViewNoteComponent.renderChips = function (containerId, people) {
  var $c = $("#" + containerId);
  $c.empty();

  if (!people || !people.length) {
    $c.append('<span class="vn-chip vn-chip-muted">None</span>');
    return;
  }

  var photoBase =
    MainApplication.profilephoto ||
    "/_layouts/15/userphoto.aspx?size=M&accountname=";

  people.forEach(function (p) {
    var name = MainApplication.ViewNoteComponent.escapeHtml(p.name || p.email);
    var email = MainApplication.ViewNoteComponent.escapeHtml(p.email || "");
    var img = photoBase + encodeURIComponent(p.email || "");
    $c.append(
      '<span class="vn-chip" title="' +
        email +
        '">' +
        '<img class="vn-chip-avatar" src="' +
        img +
        '" alt="" onerror="this.style.visibility=\'hidden\'"/>' +
        name +
        "</span>"
    );
  });
};

MainApplication.ViewNoteComponent.renderNote = function (data) {
  var esc = MainApplication.ViewNoteComponent.escapeHtml;

  // Header
  $("#vn-title").text(data.Title || data.MeetingType || "Meeting Note");
  $("#vn-reference").text(data.ReferenceID || "—");
  $("#vn-category-pill").text(data.MeetingCategory || "—");
  $("#vn-reporter").text(data.Reporter || "—");

  var status = data.Status || "—";
  var $status = $("#vn-status");
  $status
    .text(status)
    .removeClass("is-draft is-submitted");
  if (String(status).toLowerCase() === "draft") {
    $status.addClass("is-draft");
  } else if (String(status).toLowerCase() === "submitted") {
    $status.addClass("is-submitted");
  }

  // Meta
  $("#vn-date").text(MainApplication.ViewNoteComponent.formatDate(data.MeetingDate));
  $("#vn-week").text(data.MeetingWeek || "—");
  $("#vn-type").text(data.MeetingType || "—");
  $("#vn-start").text(data.StartTime || "—");
  $("#vn-end").text(data.EndTime || "—");
  $("#vn-duration").text(data.RequiredTime || "—");

  // People
  MainApplication.ViewNoteComponent.renderChips(
    "vn-timekeeper",
    MainApplication.ViewNoteComponent.normalisePeople(data.TimeKeeper)
  );
  MainApplication.ViewNoteComponent.renderChips(
    "vn-attendees",
    MainApplication.ViewNoteComponent.normalisePeople(data.Attendees)
  );
  MainApplication.ViewNoteComponent.renderChips(
    "vn-timeoff",
    MainApplication.ViewNoteComponent.normalisePeople(data.TimeOff)
  );
  MainApplication.ViewNoteComponent.renderChips(
    "vn-presenters",
    MainApplication.ViewNoteComponent.normalisePeople(data.Presenter)
  );
  MainApplication.ViewNoteComponent.renderChips(
    "vn-engagement",
    MainApplication.ViewNoteComponent.normalisePeople(data.EngagementParticipant)
  );

  // Absentees
  var absentees = MainApplication.ViewNoteComponent.parseJSON(data.Absentees);
  $("#vn-absentees-count").text(absentees.length);
  var $absBody = $("#vn-absentees").empty();
  if (!absentees.length) {
    $("#vn-absentees-table").hide();
    $("#vn-absentees-empty").removeClass("hidden");
  } else {
    $("#vn-absentees-table").show();
    $("#vn-absentees-empty").addClass("hidden");
    absentees.forEach(function (row) {
      $absBody.append(
        "<tr><td>" +
          esc(row.person || "—") +
          "</td><td>" +
          esc(row.reason || "—") +
          "</td></tr>"
      );
    });
  }

  // Agenda
  var agenda = MainApplication.ViewNoteComponent.parseJSON(data.Agenda);
  $("#vn-agenda-count").text(agenda.length);
  var $agenda = $("#vn-agenda").empty();
  if (!agenda.length) {
    $("#vn-agenda-empty").removeClass("hidden");
  } else {
    $("#vn-agenda-empty").addClass("hidden");
    agenda.forEach(function (row) {
      $agenda.append("<li>" + esc(row.agenda || "") + "</li>");
    });
  }

  // Discussion
  var discussion = MainApplication.ViewNoteComponent.parseJSON(data.Discussion);
  $("#vn-discussion-count").text(discussion.length);
  var $disc = $("#vn-discussion").empty();
  if (!discussion.length) {
    $("#vn-discussion-empty").removeClass("hidden");
  } else {
    $("#vn-discussion-empty").addClass("hidden");
    discussion.forEach(function (row) {
      $disc.append(
        '<div class="vn-discussion-item">' +
          esc(row.discussion || "") +
          "</div>"
      );
    });
  }

  // Tasks are loaded asynchronously from MeetingNoteTasks via loadMeetingTasks()
  // AOB
  var aob = (data.AOB || "").toString().trim();
  $("#vn-aob").text(aob || "None recorded.");
};

/* ------------------------------------------------------------------ */
/* Action items from MeetingNoteTasks list                             */
/* ------------------------------------------------------------------ */

MainApplication.ViewNoteComponent.loadMeetingTasks = function (referenceID) {
  if (!referenceID) {
    MainApplication.ViewNoteComponent.renderTasks([]);
    return;
  }

  var query = speedctxRoot.camlBuilder([
    {
      orderby: "ID",
      ascending: "TRUE",
    },
    {
      operator: "Eq",
      field: "ReferenceID",
      type: "Text",
      val: referenceID,
    },
    
  ]);

  speedctxRoot.getListToItems(
    "MeetingNoteTasks",
    query,
    {
      merge: false,
      ignoreThreshold: true,
      data: [
        "ID",
        "Title",
        "ReferenceID",
        "Name",
        "Email",
        "Task",
        "DueDate",
        "ActionPlan",
        "Status",
      ],
    },
    true,
    null,
    function (tableData) {
      MainApplication.ViewNoteComponent.renderTasks(tableData || []);
    },
    function (sender, args) {
      console.error(
        "Failed to load MeetingNoteTasks",
        args && args.get_message && args.get_message()
      );
      MainApplication.ViewNoteComponent.renderTasks([]);
    }
  );
};

MainApplication.ViewNoteComponent.statusClass = function (status) {
  var s = String(status || "").toLowerCase();
  if (s === "completed") return "vn-task-status is-completed";
  if (s === "in progress") return "vn-task-status is-progress";
  return "vn-task-status is-notstarted";
};

MainApplication.ViewNoteComponent.renderTasks = function (tasks) {
  var esc = MainApplication.ViewNoteComponent.escapeHtml;
  tasks = Array.isArray(tasks) ? tasks : [];

  $("#vn-tasks-count").text(tasks.length);
  var $tasks = $("#vn-tasks").empty();

  if (!tasks.length) {
    $("#vn-tasks-table").hide();
    $("#vn-tasks-empty").removeClass("hidden");
    return;
  }

  $("#vn-tasks-table").show();
  $("#vn-tasks-empty").addClass("hidden");

  tasks.forEach(function (row) {
    var type = row.Title || row.Type || "";
    var assignee = row.Name || "—";
    var status = row.Status || "Not Started";
    var taskId = row.ID || row.Id || "";
    var due = row.DueDate
      ? MainApplication.ViewNoteComponent.formatDate(row.DueDate)
      : "—";

    $tasks.append(
      "<tr>" +
        "<td>" +
        esc(assignee) +
        (type
          ? ' <small style="color:#667085">(' + esc(type) + ")</small>"
          : "") +
        "</td>" +
        "<td>" +
        esc(row.Email || "—") +
        "</td>" +
        "<td>" +
        esc(row.Task || "—") +
        "</td>" +
        "<td>" +
        esc(due) +
        "</td>" +
        "<td>" +
        esc(row.ActionPlan || "—") +
        "</td>" +
        '<td><span class="' +
        MainApplication.ViewNoteComponent.statusClass(status) +
        '">' +
        esc(status) +
        "</span></td>" +
        "<td>" +
        (taskId
          ? '<a class="vn-task-link" href="#/viewtask?itemid=' +
            encodeURIComponent(taskId) +
            '">View</a>'
          : "") +
        "</td>" +
        "</tr>"
    );
  });
};