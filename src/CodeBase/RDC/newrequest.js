loadNewRequestComponent = function () {
  if (MainApplication.cachedState.mode) {
    whenNewRequestDependeciesLoaded();
  } else {
    setTimeout(function () {
      MainApplication.cachedState.pageStateCall = loadNewRequestComponent;
    }, 1000);
  }
};

var AppRequest;
var customWorkflowEngine;

MainApplication.NewRequestComponent.ApplicationDetails = function () {
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

function whenNewRequestDependeciesLoaded() {
  // globalDefinitions.callLoader();
  $spcontext.assignAttributes();
  MainApplication.CurrentPageSubmitFunction = MainApplication.NewRequestComponent.confirmSubmit;
  AppRequest = new MainApplication.NewRequestComponent.ApplicationDetails();
  globalDefinitions.extendStages();

  MainApplication.renderMeetingCategory();
  MainApplication.DateConstraints.applyToAllDateInputs();
  MainApplication.NewRequestComponent.bindMeetingDate();
  MainApplication.NewRequestComponent.prepareAllTables();

  AppRequest.itemId = $spcontext.getParameterByName(
    "itemid",
    window.location.href,
  );
  AppRequest.mode = $spcontext.getParameterByName("mode", window.location.href);

  customWorkflowEngine = new WorkflowManagerEngine(CurrentUserProperties);
  globalDefinitions.SetWorkflowRouting(customWorkflowEngine);
  customWorkflowEngine.routeEngine(customWorkflowEngine).setCurrentUserAsInitiator();

  PeoplePicker.defaultValues = {};
  PeoplePicker.initializePeoplePickers(MainApplication.staffList);

  MainApplication.NewRequestComponent.editingActionIndex = null;

  $(document).on("change", "#start-time", function () {
    const startTime = $(this).val();
    const $endTime = $("#end-time");

    $endTime.attr("min", startTime);

    // Clear End Time if it is earlier than Start Time
    if ($endTime.val() && $endTime.val() < startTime) {
      $endTime.val("");
    }
  });
  // Handle switching between Division and Person
$(document).on("change", "#action-type", function () {
  MainApplication.NewRequestComponent.bindActionAssignee($(this).val());
});

// Add the current action item to the output table

$(document).on("click", "#add-task-btn", function () {
  const type = $("#action-type").val();
  const $assignee = $("#action-assignee");
  const selectedOption = $assignee.find("option:selected");

  const task = $("#action-task").val().trim();
  const dueDate = $("#action-due-date").val();
  const actionPlan = $("#action-plan").val().trim();

  const component = MainApplication.NewRequestComponent;
  const editingIndex = component.editingActionIndex;

  if (!type) {
    globalDefinitions.HandlerError("Please select Division or Person.");
    return;
  }

  if (!$assignee.val()) {
    globalDefinitions.HandlerError("Please select a division or staff member.");
    return;
  }

  if (!task) {
    globalDefinitions.HandlerError("Please fill the Task space.");
    return;
  }

  const isPerson = type === "Person";

  const actionItem = {
    Type: type,
    Name: isPerson
      ? selectedOption.data("name")
      : selectedOption.val(),
    Email: isPerson
      ? selectedOption.data("email")
      : "",
    Task: task,
    DueDate: dueDate,
    ActionPlan: actionPlan
  };

  if (editingIndex !== null) {
    // Update existing item
    AppRequest.actionItems[editingIndex] = actionItem;
  } else {
    // Add new item
    AppRequest.actionItems.push(actionItem);
  }

  component.renderActionItems();
  component.resetActionForm();
});

$(document).on("click", ".edit-action-btn", function () {
  const component = MainApplication.NewRequestComponent;
  const index = Number($(this).attr("data-index"));
  const item = AppRequest.actionItems[index];

  if (!item) return;

  component.editingActionIndex = index;

  $("#action-type").val(item.Type);

  // Rebuild the appropriate Division or Person dropdown
  component.bindActionAssignee(item.Type);

  // Restore the selected assignee
  $("#action-assignee")
    .val(item.Type === "Person" ? item.Email : item.Name)
    .trigger("change");

  $("#action-task").val(item.Task);
  $("#action-due-date").val(item.DueDate);
  $("#action-plan").val(item.ActionPlan);

  // Change the Add button into an Update button
  $("#add-task-btn").text("Update").attr("title", "Update Action").removeClass("icon-btn").addClass("update-task-btn");

  // Add a cancel button only once
  if (!$("#cancel-action-edit").length) {
    $("#add-task-btn").after(`
      <button
        type="button"
        id="cancel-action-edit"
        class="icon-btn"
        title="Cancel Edit"
      >×</button>
    `);
  }
});

// Delete an action item
$(document).on("click", ".delete-action-btn", function () {
  const component = MainApplication.NewRequestComponent;
  const index = Number($(this).attr("data-index"));

  if (index < 0 || index >= AppRequest.actionItems.length) return;

  AppRequest.actionItems.splice(index, 1);

  // Reset the form if the item being edited was deleted
  if (component.editingActionIndex === index) {
    component.resetActionForm();
  } else if (
    component.editingActionIndex !== null &&
    component.editingActionIndex > index
  ) {
    // Adjust the edit index after removing an earlier item
    component.editingActionIndex--;
  }

  component.renderActionItems();
});

// Cancel editing
$(document).on("click", "#cancel-action-edit", function () {
  MainApplication.NewRequestComponent.resetActionForm();
});


  $spcontext.applyValidationEvents();

  setTimeout(function () {
    if (AppRequest.itemId !== null && AppRequest.itemId !== "") {
        MainApplication.NewRequestComponent.recoverListData();
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
MainApplication.NewRequestComponent.toISODateInput = function (rawValue) {
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

MainApplication.NewRequestComponent.hydrateDynamicTables = function (savedData) {
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

// Form submission processes
MainApplication.NewRequestComponent.confirmSubmit = function (action) {
  if (action === "Draft") {
      MainApplication.confirmAction = MainApplication.NewRequestComponent.saveConfirmed;
      $("#confirmModal").modal("show");
      console.log(action);
  } else {
      MainApplication.confirmAction = MainApplication.NewRequestComponent.actionConfirmed;
      $("#confirmModal").modal("show");
      console.log(action);
  }

  AppRequest.actionTaken = action;
}

MainApplication.NewRequestComponent.actionConfirmed = function () {
  MainApplication.NewRequestComponent.saveDataToList();
};

MainApplication.NewRequestComponent.saveConfirmed = function () {
    MainApplication.NewRequestComponent.saveDataToListAsDraft();
}
MainApplication.NewRequestComponent.saveDataToList = function () {
  globalDefinitions.onActionClicked();

  var formData = $spcontext.bind({});
  var pickerValues = PeoplePicker.getValue();
  var people = PeoplePicker.getConfiguredValue();


  if ($spcontext.checkPassedValidation()) {

    try {
      // var timekeeper = pickerValues?.TimeKeeper;

      // formData.TimeKeeper =
      //     timekeeper && timekeeper.$GI_1
      //         ? timekeeper
      //         : null;
      formData.TimeKeeper = pickerValues?.TimeKeeper;
      formData.Attendees = pickerValues?.Attendees;
      formData.TimeOff = pickerValues?.TimeOff;
      formData.Presenter = pickerValues?.Presenter;
      formData.EngagementParticipant = pickerValues?.EngagementParticipant;
      
      formData.Absentees = JSON.stringify(formData.Absentees);
      formData.Agenda = JSON.stringify(formData.Agenda);
      formData.Discussion = JSON.stringify(formData.Discussion);
      formData.Tasks = JSON.stringify(AppRequest.actionItems);
      formData.NumberOfTaskItems = AppRequest.actionItems.length;

      formData.StartTime = $("#start-time").val();
      formData.EndTime = $("#end-time").val();
      
   
    } catch (error){};
    
    formData.Reporter = CurrentUserProperties.title;
    formData.Status = "Submitted";
    formData.Title = formData.MeetingType + " - Week " + formData.MeetingWeek;


    globalDefinitions.onActionCompleted();
    MainApplication.NewRequestComponent.proceedToList(formData, false);
    // console.log("Form Data to be submitted:", formData);
  } else {
    globalDefinitions.HandlerError("", true);
    globalDefinitions.onActionFailed();
  }
};

MainApplication.NewRequestComponent.saveDataToListAsDraft = function () {
  globalDefinitions.onActionClicked();
  var formData = $spcontext.bind({}, "ProcessOverview") || {};
  if ($spcontext.checkPassedValidation()) {
    formData = $spcontext.bind({});
    var pickerValues = PeoplePicker.getValue() || {};
    var people = PeoplePicker.getConfiguredValue() || {};
     try {
      formData.TimeKeeper = pickerValues?.TimeKeeper;
      formData.Attendees = pickerValues?.Attendees;
      formData.TimeOff = pickerValues?.TimeOff;
      formData.Presenter = pickerValues?.Presenter;
      formData.EngagementParticipant = pickerValues?.EngagementParticipant;
      
      formData.Absentees = JSON.stringify(formData.Absentees);
      formData.Agenda = JSON.stringify(formData.Agenda);
      formData.Discussion = JSON.stringify(formData.Discussion);
      formData.Tasks = JSON.stringify(AppRequest.actionItems);
      formData.NumberOfTaskItems = AppRequest.actionItems.length;

      formData.StartTime = $("#start-time").val();
      formData.EndTime = $("#end-time").val();
      
   
    } catch (error){};
    
    formData.Reporter = CurrentUserProperties.title;
    formData.Title = formData.MeetingType + " - Week " + formData.MeetingWeek;
    formData.Status = "Draft";
    globalDefinitions.callLoader();

    console.log("Data at SaveAsDraft: ", formData);
    MainApplication.NewRequestComponent.proceedToList(formData, false);
} else {
    globalDefinitions.HandlerError("Please fill the Process Overview part at least");
    globalDefinitions.onActionFailed();
}
  // console.log("Form Data to be submitted:", formData);
}

MainApplication.NewRequestComponent.proceedToList = function (formData) {
  const component = MainApplication.NewRequestComponent;
  const isSubmit = AppRequest.actionTaken === "submit";

  // Handle completion after the parent and any required tasks are saved
  const finishRequest = function () {
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

    component.createMeetingTasks(formData.ReferenceID, function () {
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

MainApplication.NewRequestComponent.prepareAllTables = function () {
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

MainApplication.NewRequestComponent.getWeekNumber = function (date) {
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

MainApplication.NewRequestComponent.bindMeetingDate = function () {
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

    const weekNumber = MainApplication.NewRequestComponent.getWeekNumber(date);

    $weekNumber.text(weekNumber);
    $week.removeClass("hide-week");
  });
};

// Escape values before inserting them into HTML
MainApplication.NewRequestComponent.escapeHtml = function (value) {
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
MainApplication.NewRequestComponent.bindActionAssignee = function (type) {
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
        options += `<option value="${MainApplication.NewRequestComponent.escapeHtml(name)}">${MainApplication.NewRequestComponent.escapeHtml(name)}</option>`;
      }
    });
  }

  if (type === "Person") {
    (MainApplication.staffList || []).forEach(function (staff) {
      const name = staff.Title || "";
      const email = staff.Email || "";

      if (name && email) {
        options += `<option value="${MainApplication.NewRequestComponent.escapeHtml(email)}" data-name="${MainApplication.NewRequestComponent.escapeHtml(name)}" data-email="${MainApplication.NewRequestComponent.escapeHtml(email)}">${MainApplication.NewRequestComponent.escapeHtml(name)}</option>`;
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


MainApplication.NewRequestComponent.renderActionItems = function () {
  const $container = $(".actions-blank");
  const component = MainApplication.NewRequestComponent;

  if (!AppRequest.actionItems || !AppRequest.actionItems.length) {
    $container.empty();
    return;
  }

  let rows = "";

  AppRequest.actionItems.forEach(function (item, index) {
    rows += `
      <tr>
        <td>${component.escapeHtml(item.Name)}</td>
        <td>${component.escapeHtml(item.Email || "—")}</td>
        <td>${component.escapeHtml(item.Task)}</td>
        <td>${component.escapeHtml(item.DueDate || "—")}</td>
        <td>${component.escapeHtml(item.ActionPlan || "—")}</td>
        <td>
          <button
            type="button"
            class="edit-action-btn"
            data-index="${index}"
            title="Edit"
          >Edit</button>

          <button
            type="button"
            class="delete-action-btn"
            data-index="${index}"
            title="Delete"
          >Delete</button>
        </td>
      </tr>
    `;
  });

  $container.html(`
    <table class="actions-table">
      <thead>
        <tr>
          <th>Division/Name</th>
          <th>Email</th>
          <th>Task</th>
          <th>Due Date</th>
          <th>Action Plan</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
  `);
};

MainApplication.NewRequestComponent.resetActionForm = function () {
  const component = MainApplication.NewRequestComponent;

  component.editingActionIndex = null;

  $("#action-type").val("");
  $("#action-assignee-container").empty();
  $("#action-task").val("");
  $("#action-due-date").val("");
  $("#action-plan").val("");

  $("#add-task-btn").text("+").attr("title", "Add Task").removeClass("update-task-btn").addClass("icon-btn");

  $("#cancel-action-edit").remove();
};

MainApplication.NewRequestComponent.createMeetingTasks = function (
  referenceID,
  callback
) {
  const actionItems = AppRequest.actionItems || [];

  if (!actionItems.length) {
    if (callback) callback();
    return;
  }

  const taskItems = actionItems.map(function (item) {
    return {
      ReferenceID: referenceID,
      Title: item.Type,
      Name: item.Name,
      Email: item.Email || "",
      Task: item.Task,
      DueDate: item.DueDate,
      ActionPlan: item.ActionPlans || "",
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

MainApplication.NewRequestComponent.recoverListData = function () {
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
          MainApplication.NewRequestComponent.parseSavedJSON(
            listProperties.Absentees
          );

        listProperties.Agenda =
          MainApplication.NewRequestComponent.parseSavedJSON(
            listProperties.Agenda
          );

        listProperties.Discussion =
          MainApplication.NewRequestComponent.parseSavedJSON(
            listProperties.Discussion
          );

        listProperties.Tasks =
          MainApplication.NewRequestComponent.parseSavedJSON(
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
            MainApplication.NewRequestComponent.toISODateInput(
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
         * 4. Bind normal fields
         *
         * This handles:
         * MeetingDate
         * MeetingWeek
         * MeetingCategory
         * AOB
         * etc.
         * ---------------------------------------------------------
         */

        $spcontext.htmlBind(listProperties);

        /*
         * ---------------------------------------------------------
         * 14. Restore dynamic tables
         *
         * Absentees
         * Agenda
         * Discussion
         * ---------------------------------------------------------
         */

        MainApplication.NewRequestComponent.hydrateMeetingTables({
          Absentees: listProperties.Absentees,
          Agenda: listProperties.Agenda,
          Discussion: listProperties.Discussion,
        });


        /*
         * ---------------------------------------------------------
         * 5. Meeting Category
         *
         * renderMeetingCategory() creates the Meeting Type
         * control dynamically based on the selected category.
         * ---------------------------------------------------------
         */

        var savedCategory = listProperties.MeetingCategory || "";
        var savedMeetingType = listProperties.MeetingType || "";

        $("#meeting-category").val(savedCategory);

        MainApplication.renderMeetingCategory();


        /*
         * renderMeetingCategory() has now created the correct
         * Meeting Type control.
         *
         * Find it and restore the saved value.
         */

        if (savedMeetingType) {

          var $meetingType = $(
            "#meeting-type-container select, " +
            "#meeting-type-container input"
          ).first();

          if ($meetingType.length) {
            $meetingType.val(savedMeetingType).trigger("change");
          }
        }


        /*
         * ---------------------------------------------------------
         * 6. Meeting duration
         * ---------------------------------------------------------
         */

        var selectedMeetingCategory =
          MainApplication.meetingCategory &&
          MainApplication.meetingCategory.find(function (item) {
            return (
              item.Title === savedCategory ||
              item.title === savedCategory
            );
          });

        if (selectedMeetingCategory) {

          $("#duration")
            .text(
              selectedMeetingCategory.Duration ||
              selectedMeetingCategory.duration ||
              "0"
            );

          $("#duration-container").removeClass("hide-week");
        }


        /*
         * ---------------------------------------------------------
         * 7. Meeting date / week
         * ---------------------------------------------------------
         */

        if (listProperties.MeetingWeek) {
          $("#week-number").text(listProperties.MeetingWeek);
          $(".meeting-date-label .week").removeClass("hide-week");
        } else if (listProperties.MeetingDate) {

          var dateParts = listProperties.MeetingDate
            .split("-")
            .map(Number);

          if (dateParts.length === 3) {

            var recoveredDate = new Date(
              dateParts[0],
              dateParts[1] - 1,
              dateParts[2]
            );

            var weekNumber =
              MainApplication.NewRequestComponent.getWeekNumber(
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
         * 9. Multiple PeoplePickers
         *
         * Same approach as Auditees / OtherAuditors:
         *
         * [
         *   { email: "user1@company.com" },
         *   { email: "user2@company.com" }
         * ]
         *
         * becomes:
         *
         * [
         *   "user1@company.com",
         *   "user2@company.com"
         * ]
         * ---------------------------------------------------------
         */

        var attendeesEmails =
          Array.isArray(listProperties.Attendees)
            ? [
                ...new Set(
                  listProperties.Attendees
                    .map(function (person) {
                      return person && person.email;
                    })
                    .filter(Boolean)
                ),
              ]
            : [];

        var timeOffEmails =
          Array.isArray(listProperties.TimeOff)
            ? [
                ...new Set(
                  listProperties.TimeOff
                    .map(function (person) {
                      return person && person.email;
                    })
                    .filter(Boolean)
                ),
              ]
            : [];

        var presenterEmails =
          Array.isArray(listProperties.Presenter)
            ? [
                ...new Set(
                  listProperties.Presenter
                    .map(function (person) {
                      return person && person.email;
                    })
                    .filter(Boolean)
                ),
              ]
            : [];

        var engagementParticipantEmails =
          Array.isArray(listProperties.EngagementParticipant)
            ? [
                ...new Set(
                  listProperties.EngagementParticipant
                    .map(function (person) {
                      return person && person.email;
                    })
                    .filter(Boolean)
                ),
              ]
            : [];


        /*
         * ---------------------------------------------------------
         * 10. Single PeoplePickers
         * ---------------------------------------------------------
         */

        var timeKeeperEmail =
          listProperties.TimeKeeper &&
          (
            listProperties.TimeKeeper.email ||
            listProperties.TimeKeeper.value
          ) || "";


        /*
         * ---------------------------------------------------------
         * 11. Initialize PeoplePickers first
         * ---------------------------------------------------------
         */

        PeoplePicker.initializePeoplePickers(
          MainApplication.staffList
        );


        /*
         * ---------------------------------------------------------
         * 12. Restore multiple PeoplePickers
         * ---------------------------------------------------------
         */

        PeoplePicker.setDefault(
          "Attendees",
          attendeesEmails
        );

        PeoplePicker.setDefault(
          "TimeOff",
          timeOffEmails
        );

        PeoplePicker.setDefault(
          "Presenter",
          presenterEmails
        );

        PeoplePicker.setDefault(
          "EngagementParticipant",
          engagementParticipantEmails
        );


        /*
         * ---------------------------------------------------------
         * 13. Restore single PeoplePickers
         * ---------------------------------------------------------
         */

        PeoplePicker.setDefault(
          "TimeKeeper",
          timeKeeperEmail
        );


        /*
         * ---------------------------------------------------------
         * 15. Restore Task Items
         * ---------------------------------------------------------
         */

        AppRequest.actionItems = Array.isArray(listProperties.Tasks)
          ? listProperties.Tasks
          : [];

        MainApplication.NewRequestComponent.editingActionIndex = null;

        MainApplication.NewRequestComponent.renderActionItems();


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

MainApplication.NewRequestComponent.parseSavedJSON = function (value) {
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

MainApplication.NewRequestComponent.hydrateMeetingTables = function (savedData) {
  /*
   * ---------------------------------------------------------
   * ABSENTEES
   * ---------------------------------------------------------
   */

  var absenteeRows = Array.isArray(savedData.Absentees)
    ? savedData.Absentees
    : [];

  if (absenteeRows.length > 0) {

    var absenteeCtx = AppRequest.absenteeCTX;
    var absenteeRoot = "absentees-container";

    var absenteeSettings =
      absenteeCtx &&
      absenteeCtx.dynamicTableSettings &&
      absenteeCtx.dynamicTableSettings.Absentees;

    if (absenteeSettings) {

      /*
       * Remove the blank row created by prepareAllTables()
       */

      while ($("#" + absenteeRoot).children("tr").length > 0) {
        MainApplication.deleteTableRow(
          absenteeCtx,
          0,
          "Absentees"
        );
      }


      /*
       * Recreate every saved absentee row
       */

      absenteeRows.forEach(function (rowData) {

        absenteeSettings.addRow();

        var $row = $("#" + absenteeRoot)
          .children("tr")
          .last();

        /*
         * The first column is the staff selector.
         */

        var $person = $row
          .find('[speed-table-include]')
          .eq(0);

        /*
         * Populate the selector using staffList.
         */

        if ($person.length) {

          $person.empty();

          $person.append(
            '<option value="">Select person</option>'
          );

          (MainApplication.staffList || []).forEach(
            function (staff) {

              var name = staff.Title || "";
              var email = staff.Email || "";

              if (!name || !email) {
                return;
              }

              var selected =
                email.toLowerCase() ===
                String(rowData.person || "").toLowerCase()
                  ? "selected"
                  : "";

              $person.append(
                $("<option>", {
                  value: email,
                  text: name,
                  selected: selected === "selected",
                })
              );
            }
          );

          /*
           * In case the saved value is already the person's
           * name rather than email, try matching the name too.
           */

          if (!$person.val() && rowData.person) {

            var matchingStaff =
              (MainApplication.staffList || []).find(
                function (staff) {

                  return (
                    String(staff.Title || "").toLowerCase() ===
                    String(rowData.person || "").toLowerCase()
                  );
                }
              );

            if (matchingStaff) {
              $person.val(matchingStaff.Email);
            }
          }

          $person.trigger("change");
        }


        /*
         * Second column = Reason
         */

        var $reason = $row
          .find('[speed-table-include]')
          .eq(1);

        if ($reason.length) {
          $reason.val(rowData.reason || "");
        }
      });
    }
  }


  /*
   * ---------------------------------------------------------
   * AGENDA
   * ---------------------------------------------------------
   */

  var agendaRows = Array.isArray(savedData.Agenda)
    ? savedData.Agenda
    : [];

  if (agendaRows.length > 0) {

    var agendaCtx = AppRequest.agendaCTX;
    var agendaRoot = "agenda-container";

    var agendaSettings =
      agendaCtx &&
      agendaCtx.dynamicTableSettings &&
      agendaCtx.dynamicTableSettings.Agenda;

    if (agendaSettings) {

      while ($("#" + agendaRoot).children("tr").length > 0) {
        MainApplication.deleteTableRow(
          agendaCtx,
          0,
          "Agenda"
        );
      }

      agendaRows.forEach(function (rowData) {

        agendaSettings.addRow();

        var $row = $("#" + agendaRoot)
          .children("tr")
          .last();

        var $agenda = $row
          .find('[speed-table-include]')
          .eq(0);

        if ($agenda.length) {
          $agenda.val(rowData.agenda || "");
        }
      });
    }
  }


  /*
   * ---------------------------------------------------------
   * DISCUSSION
   * ---------------------------------------------------------
   */

  var discussionRows = Array.isArray(savedData.Discussion)
    ? savedData.Discussion
    : [];

  if (discussionRows.length > 0) {

    var discussionCtx = AppRequest.discussionCTX;
    var discussionRoot = "discussion-container";

    var discussionSettings =
      discussionCtx &&
      discussionCtx.dynamicTableSettings &&
      discussionCtx.dynamicTableSettings.Discussion;

    if (discussionSettings) {

      while (
        $("#" + discussionRoot).children("tr").length > 0
      ) {
        MainApplication.deleteTableRow(
          discussionCtx,
          0,
          "Discussion"
        );
      }

      discussionRows.forEach(function (rowData) {

        discussionSettings.addRow();

        var $row = $("#" + discussionRoot)
          .children("tr")
          .last();

        var $discussion = $row
          .find('[speed-table-include]')
          .eq(0);

        if ($discussion.length) {
          $discussion.val(rowData.discussion || "");
        }
      });
    }
  }


  /*
   * Rebind delete buttons and validation after
   * dynamically creating the rows.
   */

  MainApplication.bindDeleteEvents();
  $spcontext.applyValidationEvents();
};