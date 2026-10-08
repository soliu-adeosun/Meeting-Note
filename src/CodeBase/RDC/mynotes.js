loadMyNotesComponent = function () {
  if (MainApplication.cachedState.mode) {
    whenMyNotesDependeciesLoaded();
  } else {
    MainApplication.cachedState.pageStateCall = loadMyNotesComponent;
  }
};

var AppRequest;

MainApplication.MyNotesComponent = MainApplication.MyNotesComponent || {};

MainApplication.MyNotesComponent.ApplicationDetails = function () {
  this.fullTableData = [];
  this.dataForExport = [];
  this.myNotesData = [];
  this.previousNotesData = [];
  this.currentTab = "my"; // "my" | "previous"
  this.loaded = { my: false, previous: false };
};

whenMyNotesDependeciesLoaded = function () {
  globalDefinitions.sortResponse();

  AppRequest = new MainApplication.MyNotesComponent.ApplicationDetails();

  speedctxRoot.DataForTable.tablecontentId = "speed-data-table";
  speedctxRoot.DataForTable.pagesize = 20;
  speedctxRoot.DataForTable.paginateSize = 5;
  speedctxRoot.DataForTable.modifyTR = false;
  speedctxRoot.DataForTable.context = speedctxRoot;
  speedctxRoot.DataForTable.paginationbId = "myrequestpagination";
  speedctxRoot.DataForTable.paginationuId = "toppagination";

  speedctxRoot.DataForTable.propertiesHandler = {
    ReferenceID: function (valueToEva) {
      var viewStr =
        '<a class="brown-anchor" title="View Meeting Note" href="#/viewnote?itemId=' +
        valueToEva.ReferenceID +
        '">' +
        valueToEva.ReferenceID +
        "</a>";
      var editStr =
        '<a class="brown-anchor" title="Edit Meeting Note" href="#/newmeetingnote?itemId=' +
        valueToEva.ReferenceID +
        '">' +
        valueToEva.ReferenceID +
        "</a>";

      if (valueToEva.Status === "Submitted") {
        return viewStr;
      }
      return editStr;
    },
    MeetingDate: function (valueToEva) {
      return $spcontext.stringnifyDate({
        value: valueToEva.MeetingDate,
        includeTime: false,
        format: "dd/mm/yy",
      });
    },
    Status: function (valueToEva) {
      if (valueToEva.Status === "Submitted") {
        return (
          '<span class="vn-task-status is-completed">' +
          valueToEva.Status +
          "</span>"
        );
      }
      if (valueToEva.Status === "Draft") {
        return (
          '<span class="vn-task-status is-notstarted">' +
          valueToEva.Status +
          "</span>"
        );
      }
      return valueToEva.Status || "";
    },
  };

  // Tab switching (namespaced so re-entry is safe)
  $(document)
    .off("click.notesTab", ".notes-tab")
    .on("click.notesTab", ".notes-tab", function () {
      var tab = $(this).data("tab");
      if (!tab || tab === AppRequest.currentTab) return;
      MainApplication.MyNotesComponent.switchTab(tab);
    });

  $("#status-filter, #status-filter-type")
    .off("change.notesFilter")
    .on("change.notesFilter", function () {
      MainApplication.MyNotesComponent.applyClientFilters();
    });

  $("#searchInput")
    .off("keyup.notesSearch")
    .on("keyup.notesSearch", function () {
      MainApplication.MyNotesComponent.applyClientFilters();
    });

  // Honour ?tab=previous in the hash (e.g. #/mynotes?tab=previous or redirected /previousnotes)
  var tabParam = "";
  try {
    var hash = window.location.hash || "";
    var q = hash.indexOf("?") > -1 ? hash.split("?")[1] : (window.location.search || "").replace(/^\?/, "");
    tabParam = (new URLSearchParams(q).get("tab") || "").toLowerCase();
  } catch (e) {}
  if (tabParam === "previous") {
    AppRequest.currentTab = "previous";
  }

  MainApplication.MyNotesComponent.syncTabUI();
  MainApplication.MyNotesComponent.loadActiveTab(true);
};

MainApplication.MyNotesComponent.listColumns = function () {
  return {
    merge: true,
    data: [
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
    ],
  };
};

MainApplication.MyNotesComponent.listName = function () {
  return (
    (configProperties.MTNNOTELIST && configProperties.MTNNOTELIST.setting) ||
    globalDefinitions.stageDefinitions.listname
  );
};

MainApplication.MyNotesComponent.switchTab = function (tab) {
  AppRequest.currentTab = tab;
  MainApplication.MyNotesComponent.syncTabUI();

  // Reset filters when switching
  $("#status-filter").val("");
  $("#status-filter-type").html('<option value="">All</option>');
  $("#searchInput").val("");

  MainApplication.MyNotesComponent.loadActiveTab(false);
};

MainApplication.MyNotesComponent.syncTabUI = function () {
  var tab = AppRequest.currentTab;

  $(".notes-tab").removeClass("active").attr("aria-selected", "false");
  $('.notes-tab[data-tab="' + tab + '"]')
    .addClass("active")
    .attr("aria-selected", "true");

  if (tab === "my") {
    $("#stat-drafts").show();
    $("#stat-label-total").text("Total Notes");
    $("#stat-label-submitted").text("Submitted Notes");
  } else {
    // Previous notes are all Submitted — hide draft stat
    $("#stat-drafts").hide();
    $("#stat-label-total").text("Total Notes");
    $("#stat-label-submitted").text("Submitted Notes");
  }
};

MainApplication.MyNotesComponent.loadActiveTab = function (force) {
  var tab = AppRequest.currentTab;

  if (tab === "my") {
    if (!force && AppRequest.loaded.my) {
      MainApplication.MyNotesComponent.applyDataset(AppRequest.myNotesData);
      return;
    }
    MainApplication.MyNotesComponent.retrieveMyNotes();
  } else {
    if (!force && AppRequest.loaded.previous) {
      MainApplication.MyNotesComponent.applyDataset(AppRequest.previousNotesData);
      return;
    }
    MainApplication.MyNotesComponent.retrievePreviousNotes();
  }
};

/** Notes I created (any status) */
MainApplication.MyNotesComponent.retrieveMyNotes = function () {
  var listName = MainApplication.MyNotesComponent.listName();
  if (!listName) {
    setTimeout(MainApplication.MyNotesComponent.retrieveMyNotes, 400);
    return;
  }

  var currentUser = CurrentUserProperties.title;
  var query =
    '<View Scope="RecursiveAll"><Query><Where>' +
    '<Eq><FieldRef Name="Reporter"/><Value Type="Text">' +
    currentUser +
    "</Value></Eq>" +
    '</Where><OrderBy><FieldRef Name="Modified" Ascending="FALSE"/></OrderBy>' +
    "</Query></View>";

  globalDefinitions.callLoader && globalDefinitions.callLoader();

  speedctxRoot.getListToItems(
    listName,
    query,
    MainApplication.MyNotesComponent.listColumns(),
    true,
    null,
    function (tableData) {
      AppRequest.myNotesData = tableData || [];
      AppRequest.loaded.my = true;
      if (AppRequest.currentTab === "my") {
        MainApplication.MyNotesComponent.applyDataset(AppRequest.myNotesData);
      }
    }
  );
};

/** Submitted notes I reported or attended */
MainApplication.MyNotesComponent.retrievePreviousNotes = function () {
  var listName = MainApplication.MyNotesComponent.listName();
  if (!listName) {
    setTimeout(MainApplication.MyNotesComponent.retrievePreviousNotes, 400);
    return;
  }

  var currentUserID = CurrentUserProperties.id;
  var currentUser = CurrentUserProperties.title;
  var query =
    '<View Scope="RecursiveAll"><Query><Where><And>' +
    '<Eq><FieldRef Name="Status"/><Value Type="Text">Submitted</Value></Eq>' +
    "<Or>" +
    '<Eq><FieldRef Name="Reporter"/><Value Type="Text">' +
    currentUser +
    "</Value></Eq>" +
    '<Eq><FieldRef Name="Attendees" LookupId="TRUE"/><Value Type="Integer">' +
    currentUserID +
    "</Value></Eq>" +
    "</Or></And></Where>" +
    '<OrderBy><FieldRef Name="Modified" Ascending="FALSE"/></OrderBy>' +
    "</Query></View>";

  globalDefinitions.callLoader && globalDefinitions.callLoader();

  speedctxRoot.getListToItems(
    listName,
    query,
    MainApplication.MyNotesComponent.listColumns(),
    true,
    null,
    function (tableData) {
      AppRequest.previousNotesData = tableData || [];
      AppRequest.loaded.previous = true;
      if (AppRequest.currentTab === "previous") {
        MainApplication.MyNotesComponent.applyDataset(
          AppRequest.previousNotesData
        );
      }
    }
  );
};

MainApplication.MyNotesComponent.applyDataset = function (tableData) {
  AppRequest.fullTableData = tableData || [];

  var completedItems = AppRequest.fullTableData.filter(function (item) {
    return item.Status === "Submitted";
  });
  var pendingItems = AppRequest.fullTableData.filter(function (item) {
    return item.Status === "Draft";
  });

  $("#totalRequest").text(AppRequest.fullTableData.length);
  $("#pendingRequest").text(pendingItems.length);
  $("#completedRequest").text(completedItems.length);

  MainApplication.MyNotesComponent.populateMeetingTypeFilter(
    AppRequest.fullTableData
  );
  MainApplication.MyNotesComponent.showTableData(AppRequest.fullTableData);
};

MainApplication.MyNotesComponent.populateMeetingTypeFilter = function (data) {
  var types = [];
  (data || []).forEach(function (item) {
    if (item.MeetingType) types.push(item.MeetingType);
  });
  var unique = Array.from(new Set(types)).filter(Boolean).sort();

  var $sel = $("#status-filter-type");
  var current = $sel.val();
  $sel.html('<option value="">All</option>');
  unique.forEach(function (t) {
    $sel.append($("<option>", { value: t, text: t }));
  });
  if (current) $sel.val(current);
};

MainApplication.MyNotesComponent.applyClientFilters = function () {
  var data = AppRequest.fullTableData || [];
  var category = $("#status-filter").val();
  var meetingType = $("#status-filter-type").val();
  var searchQuery = ($("#searchInput").val() || "").trim();

  var filtered = data.filter(function (item) {
    if (category && item.MeetingCategory !== category) return false;
    if (meetingType && item.MeetingType !== meetingType) return false;
    return true;
  });

  if (searchQuery && typeof MainApplication.reportSyncSearch === "function") {
    filtered = MainApplication.reportSyncSearch(searchQuery, filtered);
  } else if (searchQuery) {
    var q = searchQuery.toLowerCase();
    filtered = filtered.filter(function (item) {
      return (
        String(item.ReferenceID || "")
          .toLowerCase()
          .indexOf(q) > -1 ||
        String(item.MeetingType || "")
          .toLowerCase()
          .indexOf(q) > -1 ||
        String(item.Title || "")
          .toLowerCase()
          .indexOf(q) > -1
      );
    });
  }

  MainApplication.MyNotesComponent.showTableData(filtered);
};

MainApplication.MyNotesComponent.showTableData = function (tableData) {
  AppRequest.dataForExport = tableData;
  if (!tableData || tableData.length === 0) {
    $("#tasktable").hide();
    $("#speed-data-table").empty();
    $(".threport").hide();
    $(".norequest").show();
  } else {
    $("#tasktable").show();
    $(".threport").show();
    $(".norequest").hide();
    speedctxRoot.manualTable(tableData);
  }
  $("#newLoader").hide();
  $("#mynotes-page").removeClass("hidden");
  globalDefinitions.closeLoader();
};