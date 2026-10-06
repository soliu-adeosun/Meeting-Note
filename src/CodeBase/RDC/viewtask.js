loadViewTaskComponent = function () {
  if (MainApplication.cachedState.mode) {
    whenViewTaskDependeciesLoaded();
  } else {
    setTimeout(function () {
      MainApplication.cachedState.pageStateCall = loadViewTaskComponent;
    }, 1000);
  }
};

MainApplication.ViewTaskComponent.ApplicationDetails = function () {
  this.itemId = null;
  this.taskDetails = {};
};

function whenViewTaskDependeciesLoaded() {
  AppRequest = new MainApplication.ViewTaskComponent.ApplicationDetails();

  AppRequest.itemId =
    $spcontext.getParameterByName("itemid", window.location.href) ||
    $spcontext.getParameterByName("itemId", window.location.href);

  $("#vt-save-status")
    .off("click.vtsave")
    .on("click.vtsave", function () {
      MainApplication.ViewTaskComponent.saveStatus();
    });

  if (!AppRequest.itemId) {
    globalDefinitions.closeLoader();
    MainApplication.notyf.error("No task specified.");
    $spcontext.redirect("#/", false);
    return;
  }

  MainApplication.ViewTaskComponent.loadTask();
}

MainApplication.ViewTaskComponent.loadTask = function () {
  var query = speedctxRoot.camlBuilder([
    { rowlimit: 1 },
    {
      operator: "Eq",
      field: "ID",
      type: "Number",
      val: AppRequest.itemId,
    },
  ]);

  speedctxRoot.getListToControl(
    "MeetingNoteTasks",
    query,
    [
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
    function (item) {
      if ($.isEmptyObject(item)) {
        globalDefinitions.closeLoader();
        MainApplication.notyf.error("Task not found.");
        $spcontext.redirect("#/", false);
        return;
      }

      AppRequest.taskDetails = item;
      MainApplication.ViewTaskComponent.renderTask(item);

      $("#viewtask-page").removeClass("hidden");
      $("#newLoader").hide();
      globalDefinitions.closeLoader();
    },
    function (sender, args) {
      console.error(
        "ViewTask load failed",
        args && args.get_message && args.get_message()
      );
      globalDefinitions.closeLoader();
      MainApplication.notyf.error("Unable to load this task.");
    }
  );
};

MainApplication.ViewTaskComponent.formatDate = function (raw) {
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
  var s = String(raw);
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) {
    var p = s.substring(0, 10).split("-");
    return p[2] + "/" + p[1] + "/" + p[0];
  }
  return s;
};

MainApplication.ViewTaskComponent.renderTask = function (data) {
  var status = data.Status || "Not Started";
  var isCompleted = String(status).toLowerCase() === "completed";

  $("#vt-task-title").text(data.Task || "Action Item");
  $("#vt-reference").text(data.ReferenceID || "—");
  $("#vt-name").text(data.Name || "—");
  $("#vt-type").text(data.Title || "—");
  $("#vt-email").text(data.Email || "—");
  $("#vt-due").text(MainApplication.ViewTaskComponent.formatDate(data.DueDate));
  $("#vt-task-body").text(data.Task || "—");
  $("#vt-action-plan").text(
    (data.ActionPlan || "").toString().trim() || "None recorded."
  );

  var $badge = $("#vt-status-badge");
  $badge.text(status).removeClass("is-draft is-submitted");
  if (isCompleted) {
    $badge.addClass("is-submitted");
  } else if (String(status).toLowerCase() === "in progress") {
    $badge.css({ background: "#DBEAFE", color: "#1D4ED8" });
  } else {
    $badge.addClass("is-draft");
  }

  var $select = $("#vt-status-select");
  $select.val(status);

  if (isCompleted) {
    $select.prop("disabled", true);
    $("#vt-save-status").prop("disabled", true).hide();
    $("#vt-status-hint").text(
      "This task is Completed and can no longer be edited."
    );
  } else {
    $select.prop("disabled", false);
    $("#vt-save-status").prop("disabled", false).show();
    $("#vt-status-hint").text(
      "You can change the status until this task is marked Completed."
    );
  }

  // Link back to parent meeting note
  var ref = data.ReferenceID || "";
  if (ref) {
    $("#vt-open-note").attr("href", "#/viewnote?itemid=" + encodeURIComponent(ref));

  }
};

MainApplication.ViewTaskComponent.saveStatus = function () {
  var details = AppRequest.taskDetails || {};
  var id = details.ID || AppRequest.itemId;
  if (!id) {
    MainApplication.notyf.error("Missing task id.");
    return;
  }

  var current = String(details.Status || "").toLowerCase();
  if (current === "completed") {
    MainApplication.notyf.error("Completed tasks cannot be updated.");
    return;
  }

  var newStatus = $("#vt-status-select").val();
  if (!newStatus) {
    MainApplication.notyf.error("Please select a status.");
    return;
  }

  if (newStatus === details.Status) {
    MainApplication.notyf.error("Status is unchanged.");
    return;
  }

  globalDefinitions.callLoader();

  speedctxRoot.updateItems(
    [
      {
        ID: id,
        Status: newStatus,
      },
    ],
    "MeetingNoteTasks",
    function () {
      AppRequest.taskDetails.Status = newStatus;
      MainApplication.ViewTaskComponent.renderTask(AppRequest.taskDetails);
      globalDefinitions.closeLoader();
      MainApplication.notyf.success("Status updated to “" + newStatus + "”.");
    },
    function (sender, args) {
      globalDefinitions.closeLoader();
      console.error(
        "Status update failed",
        args && args.get_message && args.get_message()
      );
      MainApplication.notyf.error("Unable to update status.");
    }
  );
};