loadNewNoteComponent = function () {
  if (MainApplication.cachedState.mode) {
    whenNewNoteDependeciesLoaded();
  } else {
    setTimeout(function () {
      MainApplication.cachedState.pageStateCall = loadNewNoteComponent;
    }, 1000);
  }
};

var AppRequest;
var customWorkflowEngine;


MainApplication.NewNoteComponent.ApplicationDetails = function () {
  this.url = window.location.href;
  this.itemId = null;
  this.mode = null;
  this.requestDetails = {};
  this.Attachments = [];
  this.FileUrls = {};
  this.FolderUrl = "";
  this.AttachmentLoader = {};
  this.messageTemplate = {};
  this.feedback = false;
  this.approverComments = "";
  this.transactionHistory = [];
  this.defaultStage = "AA0";
  this.returned = null;
  this.sectionArr = [];
  this.sections = {};
  this.finalrating = [];
  this.questionSetCounter = 0;
  this.groupProperties = {};
  this.hodName = "";
  this.hodEmail = "";
  this.ncData = [];
  this.revisionDate = "";
  this.DocumentID = "";
  this.tableRecord = {};
  this.retrievedtableData = {};
  this.action = "";
  this.absenteeCTX = new Speed();
  this.agendaCTX = new Speed();
  this.discussionCTX = new Speed();
  this.tableCtxRegistry = {};
  this.actionItems = [];
};

function whenNewNoteDependeciesLoaded() {
  // globalDefinitions.callLoader();
  $spcontext.assignAttributes();
  MainApplication.CurrentPageSubmitFunction = MainApplication.NewNoteComponent.confirmSubmit;
  AppRequest = new MainApplication.NewNoteComponent.ApplicationDetails();
  globalDefinitions.extendStages();

  MainApplication.renderMeetingCategory();
  MainApplication.DateConstraints.applyToAllDateInputs();
  MainApplication.DateConstraints.applyMeetingDateRules();
  MainApplication.NewNoteComponent.bindMeetingDate();
  MainApplication.NewNoteComponent.prepareAllTables();
  MainApplication.NewNoteComponent.renderActionItems();

  // Support both hash query shapes: #/?itemId=… and #/newmeetingnote?itemid=…
  AppRequest.itemId =
    $spcontext.getParameterByName("itemid", window.location.href) ||
    $spcontext.getParameterByName("itemId", window.location.href) ||
    null;
  // Fallback: parse the hash search string (HashRouter keeps query after #)
  if (!AppRequest.itemId) {
    try {
      var hash = window.location.hash || "";
      var q = hash.indexOf("?") > -1 ? hash.split("?")[1] : "";
      var params = new URLSearchParams(q);
      AppRequest.itemId = params.get("itemId") || params.get("itemid");
    } catch (e) {}
  }
  AppRequest.mode =
    $spcontext.getParameterByName("mode", window.location.href) ||
    (function () {
      try {
        var h = window.location.hash || "";
        var qq = h.indexOf("?") > -1 ? h.split("?")[1] : "";
        return new URLSearchParams(qq).get("mode");
      } catch (e) {
        return null;
      }
    })();

  customWorkflowEngine = new WorkflowManagerEngine(CurrentUserProperties);
  globalDefinitions.SetWorkflowRouting(customWorkflowEngine);
  customWorkflowEngine.routeEngine(customWorkflowEngine).setCurrentUserAsInitiator();

  PeoplePicker.defaultValues = {};
  PeoplePicker.initializePeoplePickers(MainApplication.staffList);

  MainApplication.NewNoteComponent.editingActionIndex = null;

  // Namespaced handlers — .off() first so revisiting New Note does not
  // stack duplicate listeners (which caused the false "Please select
  // Division or Person" toast after the form was cleared by the first handler).
  $(document)
    .off("change.nnStartTime", "#start-time")
    .on("change.nnStartTime", "#start-time", function () {
      const startTime = $(this).val();
      const $endTime = $("#end-time");
      $endTime.attr("min", startTime);
      if ($endTime.val() && $endTime.val() < startTime) {
        $endTime.val("");
      }
    });

  $(document)
    .off("change.nnActionType", "#action-type")
    .on("change.nnActionType", "#action-type", function () {
      MainApplication.NewNoteComponent.bindActionAssignee($(this).val());
    });

  $(document)
    .off("click.nnOpenActionModal", "#open-action-modal-btn")
    .on("click.nnOpenActionModal", "#open-action-modal-btn", function () {
      MainApplication.NewNoteComponent.openActionModal();
    });

  $(document)
    .off(
      "click.nnCloseActionModal",
      "#close-action-modal, #cancel-action-modal, #action-modal-backdrop"
    )
    .on(
      "click.nnCloseActionModal",
      "#close-action-modal, #cancel-action-modal, #action-modal-backdrop",
      function () {
        MainApplication.NewNoteComponent.closeActionModal();
      }
    );

  $(document)
    .off("click.nnSaveAction", "#add-task-btn")
    .on("click.nnSaveAction", "#add-task-btn", function (e) {
      e.preventDefault();
      e.stopImmediatePropagation();

      const type = $("#action-type").val();
      const $assignee = $("#action-assignee");
      const selectedOption = $assignee.find("option:selected");

      const task = ($("#action-task").val() || "").trim();
      const dueDate = $("#action-due-date").val();
      const actionPlan = ($("#action-plan").val() || "").trim();

      const component = MainApplication.NewNoteComponent;
      const editingIndex = component.editingActionIndex;

      if (!type) {
        globalDefinitions.HandlerError("Please select Division or Person.");
        return;
      }

      if (!$assignee.length || !$assignee.val()) {
        globalDefinitions.HandlerError(
          "Please select a division or staff member."
        );
        return;
      }

      if (!task) {
        globalDefinitions.HandlerError("Please fill the Task space.");
        return;
      }

      if (!dueDate) {
        globalDefinitions.HandlerError("Please select a due date.");
        return;
      }

      const isPerson = type === "Person";

      const actionItem = {
        Type: type,
        Name: isPerson ? selectedOption.data("name") : selectedOption.val(),
        Email: isPerson ? selectedOption.data("email") : "",
        Task: task,
        DueDate: dueDate,
        ActionPlan: actionPlan,
      };

      if (editingIndex !== null && editingIndex >= 0) {
        AppRequest.actionItems[editingIndex] = actionItem;
      } else {
        AppRequest.actionItems.push(actionItem);
      }

      component.renderActionItems();
      component.closeActionModal();
    });

  $(document)
    .off("click.nnEditAction", ".edit-action-btn")
    .on("click.nnEditAction", ".edit-action-btn", function () {
      const index = Number($(this).data("index"));
      const item = AppRequest.actionItems[index];
      if (!item) return;
      MainApplication.NewNoteComponent.openActionModal(index);
    });

  $(document)
    .off("click.nnDeleteAction", ".delete-action-btn")
    .on("click.nnDeleteAction", ".delete-action-btn", function () {
      const index = Number($(this).data("index"));
      if (index < 0 || index >= AppRequest.actionItems.length) return;
      AppRequest.actionItems.splice(index, 1);
      MainApplication.NewNoteComponent.renderActionItems();
    });

  $spcontext.applyValidationEvents();

  setTimeout(function () {
    if (AppRequest.itemId !== null && AppRequest.itemId !== "") {
        MainApplication.NewNoteComponent.recoverListData();
    }
    $("#newLoader").hide();
    $("#newrequest-page").removeClass("hidden");
    globalDefinitions.closeLoader();
  }, 1000);
  
}


// stringnifyDate only ever outputs day-month-year, regardless of what
// format string you pass it - this reorders that into yyyy-mm-dd so it
// survives being dropped into an <input type="date">. Handles both "-"
// and "/" separators and 2- or 4-digit years.
MainApplication.NewNoteComponent.toISODateInput = function (rawValue) {
    if (!rawValue) {
        return "";
    }

    var parts = rawValue.split(/[-\/]/);
    if (parts.length !== 3) {
        return "";
    }

    var day = parts[0].padStart(2, "0");
    var month = parts[1].padStart(2, "0");
    var year = parts[2];

    if (year.length === 2) {
        year = (Number(year) < 70 ? "20" : "19") + year;
    }

    return `${year}-${month}-${day}`;
};

MainApplication.NewNoteComponent.hydrateDynamicTables = function (savedData) {
  Object.keys(savedData).forEach(function (tableName) {
    var ctx = AppRequest.tableCtxRegistry[tableName];
    var root = AppRequest.tableRootRegistry[tableName];
    var fieldOrder = AppRequest.tableFieldOrderRegistry[tableName];
    var rows = savedData[tableName];

    if (!ctx || !root || !Array.isArray(rows) || rows.length === 0) {
      // Nothing saved for this section yet - keep the single blank row
      // that initializeDynamicTable() already added, so the user still
      // has somewhere to start typing.
      return;
    }

    var settings = ctx.dynamicTableSettings[tableName];

    while ($("#" + root).children("tr").length > 0) {
      MainApplication.deleteTableRow(ctx, 0, tableName);
    }

    rows.forEach(function (rowData) {
      settings.addRow();

      var $row = $("#" + root).children("tr").last();
      var $inputs = $row.find(".speed-table-include");

      fieldOrder.forEach(function (fieldName, index) {
        var $input = $inputs.eq(index);
        if ($input.length) {
          $input.val(rowData[fieldName] || "");
        }
      });
    });
  });

  MainApplication.bindDeleteEvents();
  $spcontext.applyValidationEvents();
};


/**
 * Reset the entire New Meeting Note form to a blank state.
 * - Simple fields: $spcontext.resetBind() / rresetBind()
 * - People pickers: PeoplePicker.resetAll()
 * - Action items list: clear AppRequest.actionItems + re-render
 * - Dynamic tables (Absentees / Agenda / Discussion): remove all rows,
 *   then leave a single empty starter row
 * - Times, week badge, draft itemId/mode
 */
MainApplication.NewNoteComponent.clearForm = function () {
  var component = MainApplication.NewNoteComponent;

  // 1) Simple speed-bind / speed-bind-validate fields
  try {
    $spcontext.resetBind();
  } catch (e) {
    console.warn("resetBind failed", e);
  }

  // 2) People pickers
  try {
    if (typeof PeoplePicker !== "undefined" && PeoplePicker.resetAll) {
      PeoplePicker.resetAll();
    }
  } catch (e) {
    console.warn("PeoplePicker.resetAll failed", e);
  }

  // 3) Fields that are not speed-bound
  $("#start-time").val("");
  $("#end-time").val("").removeAttr("min");
  $("#week-number").text("");
  $(".meeting-date-label .week, .hide-week").addClass("hide-week");
  $("#duration").text("0");
  $("#duration-container").addClass("hide-week");

  // Meeting type secondary selector (if present)
  $("#meeting-type-container").addClass("hidden").empty();
  $("#meeting-category").val("").trigger("change");

  // 4) Action items (modal list — not a Speed dynamic table)
  if (AppRequest) {
    AppRequest.actionItems = [];
    AppRequest.itemId = null;
    AppRequest.mode = null;
  }
  component.editingActionIndex = null;
  if (typeof component.closeActionModal === "function") {
    component.closeActionModal();
  }
  if (typeof component.renderActionItems === "function") {
    component.renderActionItems();
  }

  // 5) Dynamic tables: wipe rows, then one blank row each
  component.resetDynamicTables();

  // 6) Clear validation error chrome if any
  try {
    $(".speed-error, .has-error").removeClass("speed-error has-error");
    $(".error-msg, .speed-validate-msg").remove();
  } catch (e) {}

  // 7) Strip itemId/mode from the hash so we are truly on a blank "new" URL
  try {
    var hash = window.location.hash || "#/";
    var path = hash.split("?")[0] || "#/";
    if (hash.indexOf("itemId=") > -1 || hash.indexOf("itemid=") > -1 || hash.indexOf("mode=") > -1) {
      if (window.history && window.history.replaceState) {
        var base = window.location.href.split("#")[0];
        window.history.replaceState(null, "", base + path);
      } else {
        window.location.hash = path;
      }
    }
  } catch (e) {}
};

/**
 * Remove every row from Absentees / Agenda / Discussion, then add one empty row.
 * Mirrors the approach used in hydrateDynamicTables when rebuilding from saved data.
 */
MainApplication.NewNoteComponent.resetDynamicTables = function () {
  if (!AppRequest || !AppRequest.tableCtxRegistry) return;

  var tables = ["Absentees", "Agenda", "Discussion"];

  tables.forEach(function (tableName) {
    var ctx = AppRequest.tableCtxRegistry[tableName];
    var root = AppRequest.tableRootRegistry && AppRequest.tableRootRegistry[tableName];
    if (!ctx || !root) return;

    var settings =
      ctx.dynamicTableSettings && ctx.dynamicTableSettings[tableName];
    if (!settings) return;

    // Delete from the top until the tbody is empty
    var guard = 0;
    while ($("#" + root).children("tr").length > 0 && guard < 200) {
      MainApplication.deleteTableRow(ctx, 0, tableName);
      guard++;
    }

    // One blank starter row
    MainApplication.addTableRow(ctx, tableName);
  });

  MainApplication.bindDeleteEvents();
  try {
    $spcontext.applyValidationEvents();
  } catch (e) {}
};

// Form submission processes
MainApplication.NewNoteComponent.confirmSubmit = function (action) {
  if (action === "Draft") {
      MainApplication.confirmAction = MainApplication.NewNoteComponent.saveConfirmed;
      $("#confirmModal").modal("show");
      console.log(action);
  } else {
      MainApplication.confirmAction = MainApplication.NewNoteComponent.actionConfirmed;
      $("#confirmModal").modal("show");
      console.log(action);
  }

  AppRequest.actionTaken = action;
}

MainApplication.NewNoteComponent.actionConfirmed = function () {
  MainApplication.NewNoteComponent.saveDataToList();
};

MainApplication.NewNoteComponent.saveConfirmed = function () {
    MainApplication.NewNoteComponent.saveDataToListAsDraft();
}

/**
 * Build SharePoint person field value(s) from email(s).
 * - single: returns SP.FieldUserValue or null
 * - multiple: returns SP.FieldUserValue[] (empty array if none)
 */
MainApplication.NewNoteComponent.toPersonField = function (emails, multiple) {
  multiple = !!multiple;

  function isEmptyPerson(v) {
    if (v == null || v === "") return true;
    // Arrays are handled by the caller item-by-item — never treat the array as one person
    if (Array.isArray(v)) return false;
    if (typeof v === "object") {
      var login =
        v.$GN_1 != null
          ? v.$GN_1
          : v.get_lookupValue
            ? v.get_lookupValue()
            : v.Key || v.Email || v.LoginName || "";
      var id =
        v.$62_1 != null
          ? v.$62_1
          : v.get_lookupId
            ? v.get_lookupId()
            : v.Id;
      if (String(login).trim() === "" || id === -1) return true;
    }
    return false;
  }

  // Empty / missing
  if (emails == null || emails === "") return null;
  if (Array.isArray(emails) && emails.length === 0) return null;
  // Single empty FieldUserValue-style object
  if (!Array.isArray(emails) && isEmptyPerson(emails)) return null;

  var list = Array.isArray(emails) ? emails : [emails];
  var values = [];

  list.forEach(function (email) {
    if (isEmptyPerson(email)) return;

    if (typeof email === "object" && email !== null) {
      values.push(email);
      return;
    }

    var str = String(email).trim();
    if (!str) return;
    try {
      values.push(SP.FieldUserValue.fromUser(str));
    } catch (e) {
      console.warn("Unable to create FieldUserValue for:", str, e);
    }
  });

  if (multiple) {
    return values.length ? values : null;
  }
  return values.length ? values[0] : null;
};

// helper: only set person fields when there is a real value
MainApplication.NewNoteComponent.assignPersonFields = function (
  formData,
  configured,
  pickerValues
) {
  var toPerson = MainApplication.NewNoteComponent.toPersonField;
  var map = [
    { key: "TimeKeeper", multiple: false },
    { key: "Attendees", multiple: true },
    { key: "TimeOff", multiple: true },
    { key: "Presenter", multiple: true },
    { key: "EngagementParticipant", multiple: true },
  ];

  function pickRaw(key) {
    var c = configured && configured[key];
    if (Array.isArray(c) && c.length > 0) return c;
    if (c != null && c !== "" && !Array.isArray(c)) return c;
    return pickerValues && pickerValues[key];
  }

  map.forEach(function (f) {
    var val = toPerson(pickRaw(f.key), f.multiple);
    if (val == null || (Array.isArray(val) && val.length === 0)) {
      delete formData[f.key];
    } else {
      formData[f.key] = val;
    }
  });
};

MainApplication.NewNoteComponent.saveDataToList = function () {
  globalDefinitions.onActionClicked();

  var formData = $spcontext.bind({});
  var pickerValues = PeoplePicker.getValue() || {};
  var people = PeoplePicker.getConfiguredValue() || {};


  if ($spcontext.checkPassedValidation()) {

    try {
      // Person columns need SP.FieldUserValue, not email JSON strings.
      // Prefer getConfiguredValue() (plain emails) then convert.
      MainApplication.NewNoteComponent.assignPersonFields(formData, people, pickerValues);

      formData.Absentees = JSON.stringify(formData.Absentees || []);
      formData.Agenda = JSON.stringify(formData.Agenda || []);
      formData.Discussion = JSON.stringify(formData.Discussion || []);
      formData.Tasks = JSON.stringify(AppRequest.actionItems || []);
      formData.NumberOfTaskItems = (AppRequest.actionItems || []).length;

      formData.StartTime = $("#start-time").val();
      formData.EndTime = $("#end-time").val();
    } catch (error) {
      console.error("saveDataToList field prep failed:", error);
    };
    
    formData.Reporter = CurrentUserProperties.title;
    formData.Status = "Submitted";
    formData.Title = formData.MeetingType + " - Week " + formData.MeetingWeek;


    globalDefinitions.onActionCompleted();
    MainApplication.NewNoteComponent.proceedToList(formData, false);
    // console.log("Form Data to be submitted:", formData);
  } else {
    globalDefinitions.HandlerError("", true);
    globalDefinitions.onActionFailed();
  }
};

MainApplication.NewNoteComponent.saveDataToListAsDraft = function () {
  globalDefinitions.onActionClicked();
  var formData = $spcontext.bind({}) || {};
  if ($spcontext.checkPassedValidation()) {
    formData = $spcontext.bind({});
    var pickerValues = PeoplePicker.getValue() || {};
    var people = PeoplePicker.getConfiguredValue() || {};
     try {
      MainApplication.NewNoteComponent.assignPersonFields(formData, people, pickerValues);
      // var toPerson = MainApplication.NewNoteComponent.toPersonField;

      // formData.TimeKeeper = toPerson(
      //   people.TimeKeeper || pickerValues.TimeKeeper,
      //   false
      // );
      // formData.Attendees = toPerson(
      //   people.Attendees || pickerValues.Attendees,
      //   true
      // );
      // formData.TimeOff = toPerson(
      //   people.TimeOff || pickerValues.TimeOff,
      //   true
      // );
      // formData.Presenter = toPerson(
      //   people.Presenter || pickerValues.Presenter,
      //   true
      // );
      // formData.EngagementParticipant = toPerson(
      //   people.EngagementParticipant || pickerValues.EngagementParticipant,
      //   true
      // );

      formData.Absentees = JSON.stringify(formData.Absentees || []);
      formData.Agenda = JSON.stringify(formData.Agenda || []);
      formData.Discussion = JSON.stringify(formData.Discussion || []);
      formData.Tasks = JSON.stringify(AppRequest.actionItems || []);
      formData.NumberOfTaskItems = (AppRequest.actionItems || []).length;

      formData.StartTime = $("#start-time").val();
      formData.EndTime = $("#end-time").val();
    } catch (error) {
      console.error("saveDataToListAsDraft field prep failed:", error);
    };
    
    formData.Reporter = CurrentUserProperties.title;
    formData.Title = formData.MeetingType + " - Week " + formData.MeetingWeek;
    formData.Status = "Draft";
    globalDefinitions.callLoader();

    console.log("Data at SaveAsDraft: ", formData);
    MainApplication.NewNoteComponent.proceedToList(formData, false);
} else {
    globalDefinitions.HandlerError("", true);
    globalDefinitions.onActionFailed();
}
  // console.log("Form Data to be submitted:", formData);
}

MainApplication.NewNoteComponent.proceedToList = function (formData) {
  const component = MainApplication.NewNoteComponent;
  const isSubmit = AppRequest.actionTaken === "submit";

  // Handle completion after the parent and any required tasks are saved
  const finishRequest = function () {
      MainApplication.NewNoteComponent.clearForm();
    if (isSubmit) {
      globalDefinitions.HandlerSuccess("Note created successfully");

      globalDefinitions.AuditLogManager_SaveLog({
        Action: `Submitted Note ${formData.ReferenceID}`
      });
    } else {
      globalDefinitions.HandlerSuccess("Note saved as draft successfully");

      globalDefinitions.AuditLogManager_SaveLog({
        Action: `Saved Note ${formData.ReferenceID}`
      });
    }

    $spcontext.redirect("#/", false);
    globalDefinitions.closeLoader();
    globalDefinitions.onActionCompleted();
  };

  // Create tasks only when the action is Submit
  const saveTasksIfSubmitted = function () {
    if (!isSubmit) {
      finishRequest();
      return;
    }

    component.createMeetingTasks(formData, function () {
      finishRequest();
    });
  };

  if (AppRequest.itemId == null) {
    var dateCreatedCode = $spcontext.stringnifyDate({
      includeTime: true,
      timeSpace: false,
      format: "dd-mm-yy"
    });

    formData.ReferenceID =
      globalDefinitions.stageDefinitions.workflowcode + dateCreatedCode;

    console.log("New data about to be created:", formData);

    speedctxRoot.createItems(
      [formData],
      globalDefinitions.stageDefinitions.listname,
      function (createdItemsProperties) {
        saveTasksIfSubmitted();
      }
    );
  } else {
    console.log("New data about to be updated:", formData);

    formData.ID = AppRequest.requestDetails.ID;

    // Preserve the existing ReferenceID when updating
    formData.ReferenceID =
      formData.ReferenceID || AppRequest.requestDetails.ReferenceID;

    speedctxRoot.updateItems(
      [formData],
      globalDefinitions.stageDefinitions.listname,
      function () {
        saveTasksIfSubmitted();
      }
    );
  }
};

MainApplication.NewNoteComponent.prepareAllTables = function () {
  MainApplication.initializeDynamicTable({
    ctx: AppRequest.absenteeCTX,

    tableName: "Absentees",

    root: "absentees-container",

    addButton: "#add-absentee-btn",

    bindExtensions: {
      person: MainApplication.selectColumn("person"),
      reason: MainApplication.textAreaColumn("reason"),
      action: MainApplication.deleteColumn(AppRequest.absenteeCTX, "Absentees"),
    },
  });

  MainApplication.initializeDynamicTable({
    ctx: AppRequest.agendaCTX,

    tableName: "Agenda",

    root: "agenda-container",

    addButton: "#add-agenda-btn",

    bindExtensions: {
      agenda: MainApplication.textColumn("agenda"),
      action: MainApplication.deleteColumn(AppRequest.agendaCTX, "Agenda"),
    },
  });

  MainApplication.initializeDynamicTable({
    ctx: AppRequest.discussionCTX,

    tableName: "Discussion",

    root: "discussion-container",

    addButton: "#add-discussion-button",

    bindExtensions: {
      discussion: MainApplication.textAreaColumn("discussion"),

      action: MainApplication.deleteColumn(AppRequest.discussionCTX, "Discussion"),
    },
  });
}

MainApplication.NewNoteComponent.getWeekNumber = function (date) {
  // Clone the date so we don't modify the original
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
  );

  // Set to nearest Thursday
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));

  // Get first day of the year
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));

  // Calculate full weeks
  return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
};

MainApplication.NewNoteComponent.bindMeetingDate = function () {
  const $dateInput = $('[speed-bind-validate="MeetingDate"]');
  const $week = $(".meeting-date-label .week");
  const $weekNumber = $("#week-number");

  $dateInput.off("change.meetingDate").on("change.meetingDate", function () {
    const selectedDate = $(this).val();

    if (!selectedDate) {
      $week.addClass("hide-week");
      $weekNumber.text("");
      return;
    }

    // Parse the date as a local date to avoid timezone issues
    const [year, month, day] = selectedDate.split("-").map(Number);
    const date = new Date(year, month - 1, day);

    const weekNumber = MainApplication.NewNoteComponent.getWeekNumber(date);

    $weekNumber.text(weekNumber);
    $week.removeClass("hide-week");
  });
};

// Escape values before inserting them into HTML
MainApplication.NewNoteComponent.escapeHtml = function (value) {
  return String(value == null ? "" : value).replace(/[&<>"']/g, function (char) {
    return {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    }[char];
  });
};

// Populate the assignee dropdown based on the selected type
MainApplication.NewNoteComponent.bindActionAssignee = function (type) {
  const $container = $("#action-assignee-container");
  $container.empty();

  if (!type) return;

  let options = '<option value="">Select...</option>';

  if (type === "Division") {
    (MainApplication.newDivisions || []).forEach(function (division) {
      const name = typeof division === "string"
        ? division
        : division.Title || "";

      if (name) {
        options += `<option value="${MainApplication.NewNoteComponent.escapeHtml(name)}">${MainApplication.NewNoteComponent.escapeHtml(name)}</option>`;
      }
    });
  }

  if (type === "Person") {
    (MainApplication.staffList || []).forEach(function (staff) {
      const name = staff.Title || "";
      const email = staff.Email || "";

      if (name && email) {
        options += `<option value="${MainApplication.NewNoteComponent.escapeHtml(email)}" data-name="${MainApplication.NewNoteComponent.escapeHtml(name)}" data-email="${MainApplication.NewNoteComponent.escapeHtml(email)}">${MainApplication.NewNoteComponent.escapeHtml(name)}</option>`;
      }
    });
  }

  $container.append(`
    <select id="action-assignee" class="form-select">
      ${options}
    </select>
  `);
};

// Render the collected action items into the output table


MainApplication.NewNoteComponent.openActionModal = function (editIndex) {
  const component = MainApplication.NewNoteComponent;
  component.editingActionIndex =
    typeof editIndex === "number" ? editIndex : null;

  const isEdit = component.editingActionIndex !== null;
  $("#action-modal-title").text(isEdit ? "Edit Action Item" : "Add Action Item");
  $("#add-task-btn").text(isEdit ? "Update item" : "Add item");

  component.resetActionFormFields();

  if (isEdit) {
    const item = AppRequest.actionItems[component.editingActionIndex];
    if (item) {
      $("#action-type").val(item.Type);
      component.bindActionAssignee(item.Type);
      setTimeout(function () {
        if (item.Type === "Person") {
          $("#action-assignee").val(item.Email);
        } else {
          $("#action-assignee").val(item.Name);
        }
      }, 0);
      $("#action-task").val(item.Task || "");
      $("#action-due-date").val(item.DueDate || "");
      $("#action-plan").val(item.ActionPlan || "");
    }
  }

  $("#action-item-modal").removeClass("hidden").attr("aria-hidden", "false");
};

MainApplication.NewNoteComponent.closeActionModal = function () {
  MainApplication.NewNoteComponent.editingActionIndex = null;
  MainApplication.NewNoteComponent.resetActionFormFields();
  $("#action-item-modal").addClass("hidden").attr("aria-hidden", "true");
};

MainApplication.NewNoteComponent.resetActionFormFields = function () {
  $("#action-type").val("");
  $("#action-assignee-container").html(
    '<select id="action-assignee" class="form-select" disabled><option value="">Select type first…</option></select>'
  );
  $("#action-task").val("");
  $("#action-due-date").val("");
  $("#action-plan").val("");
};

// Back-compat alias used elsewhere
MainApplication.NewNoteComponent.resetActionForm =
  MainApplication.NewNoteComponent.closeActionModal;

MainApplication.NewNoteComponent.renderActionItems = function () {
  const $container = $(".actions-blank");
  const component = MainApplication.NewNoteComponent;
  const items = AppRequest.actionItems || [];

  if (!items.length) {
    $container.html(
      '<div class="ai-empty">No action items yet. Click <strong>+</strong> to add one.</div>'
    );
    return;
  }

  let rows = "";
  items.forEach(function (item, index) {
    rows += `
      <tr>
        <td>
          <div class="ai-assignee-cell">
            <strong>${component.escapeHtml(item.Name)}</strong>
            <small>${component.escapeHtml(item.Type || "")}${
              item.Email
                ? " · " + component.escapeHtml(item.Email)
                : ""
            }</small>
          </div>
        </td>
        <td>${component.escapeHtml(item.Task)}</td>
        <td>${component.escapeHtml(item.DueDate || "—")}</td>
        <td>${component.escapeHtml(item.ActionPlan || "—")}</td>
        <td class="ai-row-actions">
          <button type="button" class="edit-action-btn" data-index="${index}" title="Edit">Edit</button>
          <button type="button" class="delete-action-btn" data-index="${index}" title="Delete">Delete</button>
        </td>
      </tr>`;
  });

  $container.html(`
    <table class="actions-table ai-list-table">
      <thead>
        <tr>
          <th>Assignee</th>
          <th>Task</th>
          <th>Due Date</th>
          <th>Action Plan</th>
          <th></th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `);
};

MainApplication.NewNoteComponent.createMeetingTasks = function (
  formData,
  callback
) {
  const actionItems = AppRequest.actionItems || [];

  if (!actionItems.length) {
    if (callback) callback();
    return;
  }
  const referenceID = formData.ReferenceID || "";
  const meetingType = formData.MeetingType || "";
  const meetingCategory = formData.MeetingCategory || "";

  const taskItems = actionItems.map(function (item) {
    return {
      ReferenceID: referenceID,
      Title: item.Type,
      Name: item.Name,
      Email: item.Email || "",
      Task: item.Task,
      DueDate: item.DueDate,
      ActionPlan: item.ActionPlan || "",
      Status: "Not Started",
      MeetingType: meetingType,
      MeetingCategory: meetingCategory,
    };
  });

  console.log("Meeting tasks to be created:", taskItems);

  speedctxRoot.createItems(
    taskItems,
    "MeetingNoteTasks",
    function (createdTasks) {
      console.log("Meeting tasks created successfully:", createdTasks);

      if (callback) callback();
    }
  );
};

MainApplication.NewNoteComponent.recoverListData = function () {
  if (AppRequest.itemId !== null && AppRequest.itemId !== "") {

    var query = speedctxRoot.camlBuilder([
      {
        rowlimit: 1,
      },
      {
        operator: "Eq",
        field: "ReferenceID",
        type: "Text",
        val: AppRequest.itemId,
      },
      {
        operator: "Eq",
        field: "Status",
        type: "Text",
        val: globalDefinitions.stageDefinitions.save,
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
      globalDefinitions.stageDefinitions.listname,
      query,
      extraProperties,
      function (listProperties) {

        if ($.isEmptyObject(listProperties)) {
          MainApplication.notyf.error("Process does not exist...");
          $spcontext.redirect("#/", false);
          globalDefinitions.closeLoader();
          return;
        }

        console.log("Recovering saved meeting data:", listProperties);

        /*
         * ---------------------------------------------------------
         * 1. Convert saved JSON fields back to JavaScript objects
         * ---------------------------------------------------------
         */

        listProperties.Absentees =
          MainApplication.NewNoteComponent.parseSavedJSON(
            listProperties.Absentees
          );

        listProperties.Agenda =
          MainApplication.NewNoteComponent.parseSavedJSON(
            listProperties.Agenda
          );

        listProperties.Discussion =
          MainApplication.NewNoteComponent.parseSavedJSON(
            listProperties.Discussion
          );

        listProperties.Tasks =
          MainApplication.NewNoteComponent.parseSavedJSON(
            listProperties.Tasks
          );


        /*
         * ---------------------------------------------------------
         * 2. Convert MeetingDate to yyyy-mm-dd
         * ---------------------------------------------------------
         */

        if (listProperties.MeetingDate) {

          var meetingDate = $spcontext.stringnifyDate({
            value: listProperties.MeetingDate,
            includeTime: false,
            format: "dd/mm/yy",
          });

          listProperties.MeetingDate =
            MainApplication.NewNoteComponent.toISODateInput(
              meetingDate
            );
        }

        // listProperties.Absentees = $spcontext.JSONToObject(listProperties.Absentees);
        // listProperties.Agenda = $spcontext.JSONToObject(listProperties.Agenda);
        // listProperties.Discussion = $spcontext.JSONToObject(listProperties.Discussion);

        /*
         * ---------------------------------------------------------
         * 3. Store recovered request
         * ---------------------------------------------------------
         */

        AppRequest.requestDetails = listProperties;


        /*
         * ---------------------------------------------------------
         * 4. Bind normal scalar fields (MeetingDate, AOB, etc.)
         *    MeetingCategory / MeetingType are restored separately
         *    because the category control is rebuilt dynamically.
         * ---------------------------------------------------------
         */

        $spcontext.htmlBind(listProperties);


        /*
         * ---------------------------------------------------------
         * 5. Meeting Category + Meeting Type
         *
         * renderMeetingCategory() empties #meeting-category and
         * rebuilds its options, then wires a change handler that
         * creates the Meeting Type control. Order matters:
         *   1) rebuild options
         *   2) set saved category + trigger change (creates type UI)
         *   3) set saved meeting type on the new control
         * ---------------------------------------------------------
         */

        var savedCategory = listProperties.MeetingCategory || "";
        var savedMeetingType = listProperties.MeetingType || "";

        MainApplication.renderMeetingCategory();

        if (savedCategory) {
          $("#meeting-category").val(savedCategory).trigger("change");
        }

        if (savedMeetingType) {
          // The change handler builds either a <select> or <input>
          var $meetingType = $(
            "#meeting-type-container select, #meeting-type-container input"
          ).first();

          if ($meetingType.length) {
            $meetingType.val(savedMeetingType).trigger("change");
          }
        }


        /*
         * ---------------------------------------------------------
         * 6. Meeting duration label
         * ---------------------------------------------------------
         */

        var selectedMeetingCategory =
          MainApplication.meetingCategory &&
          MainApplication.meetingCategory.find(function (item) {
            return (
              (item.Title || item.title || "") === savedCategory
            );
          });

        if (selectedMeetingCategory) {
          $("#duration").text(
            selectedMeetingCategory.Duration ||
              selectedMeetingCategory.duration ||
              "0"
          );
          $("#duration-container").removeClass("hide-week");
        }


        /*
         * ---------------------------------------------------------
         * 7. Meeting date / week display
         * ---------------------------------------------------------
         */

        if (listProperties.MeetingWeek) {
          $("#week-number").text(listProperties.MeetingWeek);
          $(".meeting-date-label .week").removeClass("hide-week");
        } else if (listProperties.MeetingDate) {
          var dateParts = String(listProperties.MeetingDate)
            .split("-")
            .map(Number);

          if (dateParts.length === 3) {
            var recoveredDate = new Date(
              dateParts[0],
              dateParts[1] - 1,
              dateParts[2]
            );
            var weekNumber =
              MainApplication.NewNoteComponent.getWeekNumber(
                recoveredDate
              );
            $("#week-number").text(weekNumber);
            $(".meeting-date-label .week").removeClass("hide-week");
          }
        }


        /*
         * ---------------------------------------------------------
         * 8. Start / End Time
         * ---------------------------------------------------------
         */

        $("#start-time").val(listProperties.StartTime || "");
        $("#end-time").val(listProperties.EndTime || "");

        if (listProperties.StartTime) {
          $("#end-time").attr("min", listProperties.StartTime);
        }


        /*
         * ---------------------------------------------------------
         * 9. Restore dynamic tables (Absentees / Agenda / Discussion)
         * ---------------------------------------------------------
         */

        MainApplication.NewNoteComponent.hydrateMeetingTables({
          Absentees: listProperties.Absentees,
          Agenda: listProperties.Agenda,
          Discussion: listProperties.Discussion,
        });


        /*
         * ---------------------------------------------------------
         * 10–13. PeoplePickers
         *
         * Saved values may be plain emails, JSON strings, arrays of
         * emails, or objects with an email property (depending on
         * control-value-type and how SharePoint stored them).
         *
         * PeoplePicker.setDefault only seeds defaultValues — the
         * values are applied when initializePeoplePickers runs.
         * So: normalize → setDefault → re-initialize.
         * ---------------------------------------------------------
         */

        var attendeesEmails =
          MainApplication.NewNoteComponent.normalizePeopleEmails(
            listProperties.Attendees
          );
        var timeOffEmails =
          MainApplication.NewNoteComponent.normalizePeopleEmails(
            listProperties.TimeOff
          );
        var presenterEmails =
          MainApplication.NewNoteComponent.normalizePeopleEmails(
            listProperties.Presenter
          );
        var engagementParticipantEmails =
          MainApplication.NewNoteComponent.normalizePeopleEmails(
            listProperties.EngagementParticipant
          );
        var timeKeeperEmails =
          MainApplication.NewNoteComponent.normalizePeopleEmails(
            listProperties.TimeKeeper
          );
        // single-select: pass a string, not an array
        var timeKeeperEmail =
          timeKeeperEmails.length ? timeKeeperEmails[0] : "";

        PeoplePicker.defaultValues = {};

        if (attendeesEmails.length) {
          PeoplePicker.setDefault("Attendees", attendeesEmails);
        }
        if (timeOffEmails.length) {
          PeoplePicker.setDefault("TimeOff", timeOffEmails);
        }
        if (presenterEmails.length) {
          PeoplePicker.setDefault("Presenter", presenterEmails);
        }
        if (engagementParticipantEmails.length) {
          PeoplePicker.setDefault(
            "EngagementParticipant",
            engagementParticipantEmails
          );
        }
        if (timeKeeperEmail) {
          PeoplePicker.setDefault("TimeKeeper", timeKeeperEmail);
        }

        PeoplePicker.initializePeoplePickers(MainApplication.staffList);

        // Belt-and-suspenders: force Select2 values in case defaults
        // were missed (e.g. option list still loading).
        function applyPickerVal(pickerId, emails, multiple) {
          var $p = $('[custom-people="' + pickerId + '"]');
          if (!$p.length) return;
          if (multiple) {
            $p.val(emails || []).trigger("change");
          } else {
            $p.val(emails || null).trigger("change");
          }
        }
        applyPickerVal("Attendees", attendeesEmails, true);
        applyPickerVal("TimeOff", timeOffEmails, true);
        applyPickerVal("Presenter", presenterEmails, true);
        applyPickerVal(
          "EngagementParticipant",
          engagementParticipantEmails,
          true
        );
        applyPickerVal("TimeKeeper", timeKeeperEmail || null, false);


        /*
         * ---------------------------------------------------------
         * 15. Restore Task Items
         * ---------------------------------------------------------
         */

        AppRequest.actionItems = Array.isArray(listProperties.Tasks)
          ? listProperties.Tasks
          : [];

        MainApplication.NewNoteComponent.editingActionIndex = null;

        MainApplication.NewNoteComponent.renderActionItems();


        /*
         * ---------------------------------------------------------
         * 16. Re-apply validation
         * ---------------------------------------------------------
         */

        $spcontext.applyValidationEvents();


        /*
         * ---------------------------------------------------------
         * 17. Show the recovered form
         * ---------------------------------------------------------
         */

        $("#newrequest-page").removeClass("hidden");
        $("#newLoader").hide();

        globalDefinitions.closeLoader();

        console.log(
          "Meeting draft recovered successfully:",
          AppRequest.requestDetails
        );
      }
    );

  } else {

    globalDefinitions.closeLoader();

    MainApplication.notyf.error("Invalid Request...");
    $spcontext.redirect("#/", false);
  }
};

MainApplication.NewNoteComponent.parseSavedJSON = function (value) {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value === "object") {
    return value;
  }

  if (typeof value === "string") {
    try {
      return JSON.parse(value) || [];
    } catch (error) {
      console.warn("Unable to parse saved JSON:", value, error);
      return [];
    }
  }

  return [];
};

MainApplication.NewNoteComponent.normalizePeopleEmails = function (value) {

  if (value == null || value === "") return [];

  if (typeof value === "string") {
    var trimmed = value.trim();
    if (!trimmed) return [];
    // Try JSON first
    if (trimmed.charAt(0) === "[" || trimmed.charAt(0) === "{") {
      try {
        return MainApplication.NewNoteComponent.normalizePeopleEmails(
          JSON.parse(trimmed)
        );
      } catch (e) {
        // plain email string
        return [trimmed];
      }
    }
    return [trimmed];
  }

  if (!Array.isArray(value)) {
    value = [value];
  }

  var emails = [];
  value.forEach(function (item) {
    if (item == null || item === "") return;

    if (typeof item === "string") {
      if (item.trim()) emails.push(item.trim());
      return;
    }

    if (typeof item === "object") {
      var email =
        item.email ||
        item.Email ||
        item.value ||
        item.Key ||
        item.loginName ||
        item.LoginName ||
        "";

      // SP.FieldUserValue sometimes exposes get_email / get_lookupValue
      if (!email && typeof item.get_email === "function") {
        try { email = item.get_email(); } catch (e) {}
      }
      if (!email && typeof item.get_lookupValue === "function") {
        try { email = item.get_lookupValue(); } catch (e) {}
      }
      // fromUser stores the account in $1_1 / $5_1 depending on build – fall back to toString
      if (!email && typeof item.toString === "function") {
        var asStr = String(item);
        if (asStr.indexOf("@") > -1) email = asStr;
      }

      if (email && String(email).trim()) {
        emails.push(String(email).trim());
      }
    }
  });

  // de-dupe case-insensitively, preserve first casing
  var seen = {};
  var unique = [];
  emails.forEach(function (e) {
    var key = e.toLowerCase();
    if (!seen[key]) {
      seen[key] = true;
      unique.push(e);
    }
  });
  return unique;
};

MainApplication.NewNoteComponent.hydrateMeetingTables = function (savedData) {
  /*
   * Use Speed's displayRows so bindExtensions (textColumn / textAreaColumn /
   * selectColumn) receive the full row object and pre-fill values correctly.
   * Manually addRow() + .val() was failing because the selector targeted an
   * attribute ([speed-table-include]) instead of the class (.speed-table-include).
   */
  function hydrateOne(tableName, rows, ctx) {
    rows = Array.isArray(rows) ? rows : [];
    if (!rows.length || !ctx) return;

    var settings =
      ctx.dynamicTableSettings && ctx.dynamicTableSettings[tableName];
    if (!settings || typeof settings.displayRows !== "function") return;

    // displayRows replaces tbody contents via manualTable
    settings.displayRows(rows);
  }

  hydrateOne("Absentees", savedData.Absentees, AppRequest.absenteeCTX);
  hydrateOne("Agenda", savedData.Agenda, AppRequest.agendaCTX);
  hydrateOne("Discussion", savedData.Discussion, AppRequest.discussionCTX);

  MainApplication.bindDeleteEvents();
  $spcontext.applyValidationEvents();
}
;