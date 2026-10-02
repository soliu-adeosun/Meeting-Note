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
  // globalDefinitions.extendStages();

  MainApplication.renderMeetingCategory();
  MainApplication.DateConstraints.applyToAllDateInputs();
  MainApplication.NewRequestComponent.bindMeetingDate();
  MainApplication.NewRequestComponent.prepareAllTables();

  AppRequest.itemId = $spcontext.getParameterByName(
    "itemid",
    window.location.href,
  );
  AppRequest.mode = $spcontext.getParameterByName("mode", window.location.href);

  PeoplePicker.defaultValues = {};
  PeoplePicker.initializePeoplePickers(MainApplication.staffList);

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

  if (!type) {
    globalDefinitions.HandlerError("Please select Division or Person.");
    return;
  }

  if (!$assignee.val()) {
    globalDefinitions.HandlerError("Please select a division or staff member.");
    return;
  }

  if (!task || !dueDate || !actionPlan) {
    globalDefinitions.HandlerError("Please complete the Task, Due Date and Action Plan fields.");
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

  AppRequest.actionItems.push(actionItem);
  MainApplication.NewRequestComponent.renderActionItems();

  // Reset the entry form
  $("#action-type").val("");
  $("#action-assignee-container").empty();
  $("#action-task").val("");
  $("#action-due-date").val("");
  $("#action-plan").val("");
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

MainApplication.NewRequestComponent.togglePullFromOtherSystem = function (value) {
  

    if (value === "Yes") {

        MainApplication.renderField({
            containerId: "pullDataContainer",
            className: "top-space",
            type: "textarea",
            bindValidate: "SystemInformation",
            placeholder: "Describe the information to be pulled...",
            rows: 4,
            required: true
        });

    } else {
        $("#pullDataContainer").empty();
    }
}

MainApplication.NewRequestComponent.toggleRelatedProcess = function (value) {
  

    if (value === "Yes") {

        MainApplication.renderField({
            containerId: "relatedProcessContainer",
            className: "top-space",
            type: "textarea",
            bindValidate: "RelatedProcessInformation",
            placeholder: "Describe the information to be pulled...",
            rows: 4,
            required: true
        });

    } else {
        $("#relatedProcessContainer").empty();
    }
}

// Request Type ("New" / "Modification") gates the whole form below it.
// - "New" -> show the full form.
// - "Modification" -> reveal the "Modification" (Minor/Major) selector.
//     - "Minor" -> show only a description text area.
//     - "Major" -> show the full form, same as "New".
//
// toggleMainForm() is what actually shows/hides the big form and, just as
// importantly, strips speed-bind-validate / speed-validate-mode from
// everything inside it while it's hidden so $spcontext.checkPassedValidation()
// doesn't block submission on fields the user can't see. Nothing inside the
// wrapper is touched otherwise, so whatever the user already filled in is
// still there if they flip back to "New"/"Major".

// MainApplication.NewRequestComponent.tableCtxRegistry = {};


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

MainApplication.NewRequestComponent.deleteTableRow = function (ctx, pos, tableName) {
    ctx.dynamicTableSettings[tableName].deleteRow(pos);
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

  formData.ExtraFeatures = MainApplication.getExtraFeatures("extraFeaturesTable");
  formData.StepByStepProcess = JSON.stringify(formData.StepByStepProcess);
  formData.Approvers = JSON.stringify(formData.Approvers);
  formData.Notifications = JSON.stringify(formData.Notifications);
  formData.UserAccess = JSON.stringify(formData.UserAccess);
  formData.Reports = JSON.stringify(formData.Reports);
  formData.ExtraFeatures = JSON.stringify(formData.ExtraFeatures);
  if ($spcontext.checkPassedValidation()) {

    try {
      var delegate = pickerValues?.Delegate;

      formData.Delegate =
          delegate && delegate.$GI_1
              ? delegate
              : null;
      formData.DivisionsInvolved = $("#divisionsInvolved").val() || [];
      formData.DivisionsInvolved = JSON.stringify(formData.DivisionsInvolved);
      formData.EmployeeEmail = CurrentUserProperties.email;
      
      formData.HOD = SP.FieldUserValue.fromUser(
        MainApplication.staffDetails[formData.EmployeeEmail].HodEmail,
      );
      formData.HODEmail =
        MainApplication.staffDetails[formData.EmployeeEmail].HodEmail;
      formData.Division =
        MainApplication.staffDetails[formData.EmployeeEmail].Department;
    } catch (error){};
    

    formData.Title = CurrentUserProperties.title;
    globalDefinitions.callLoader();
    AppRequest.returned = AppRequest.requestDetails.ReturnForCorrection;

    customWorkflowEngine.updateStageByName({
      name: globalDefinitions.stageDefinitions.hod,
      username: MainApplication.staffDetails[formData.HODEmail].Title,
      authenticationValue: formData.HODEmail,
      emails: [formData.HODEmail],
    });

    if (AppRequest.mode === "correction"){
      formData.ReturnForCorrection = "No";
      formData = customWorkflowEngine
      .routeEngine(customWorkflowEngine)
      .requestHistoryHandler(formData, AppRequest.requestDetails.Transaction_History, {
        stage: globalDefinitions.stageDefinitions.employee,
        action: "Application Re-submitted",
      });
    } else {
      formData = customWorkflowEngine
      .routeEngine(customWorkflowEngine)
      .requestHistoryHandler(formData, AppRequest.transactionHistory, {
        stage: globalDefinitions.stageDefinitions.employee,
        action: "Application Submitted",
      });
    }
    formData = customWorkflowEngine
      .routeEngine(customWorkflowEngine)
      .runRouting(formData);

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
      formData.ExtraFeatures = MainApplication.getExtraFeatures("extraFeaturesTable") || {};
      formData.StepByStepProcess = JSON.stringify(formData.StepByStepProcess) || {};
      formData.Approvers = JSON.stringify(formData.Approvers) || {};
      formData.Notifications = JSON.stringify(formData.Notifications) || {};
      formData.UserAccess = JSON.stringify(formData.UserAccess) || {};
      formData.Reports = JSON.stringify(formData.Reports) || {};
      formData.ExtraFeatures = JSON.stringify(formData.ExtraFeatures) || {};
      // if (formData.DateRequired) {
      // formData.DateRequired = $spcontext.stringnifyDate({
      //     value: formData.DateRequired,
      //     includeTime: false,
      //     format: "dd-mm-yy",
      // });
      // } else {
      //     formData.DateRequired = null;
      // }

      var delegate = pickerValues?.Delegate;

      formData.Delegate =
          delegate && delegate.$GI_1
              ? delegate
              : null;
      formData.DivisionsInvolved = $("#divisionsInvolved").val() || [];
      formData.DivisionsInvolved = JSON.stringify(formData.DivisionsInvolved) || {};
    } catch (error) {};
    formData.EmployeeEmail = CurrentUserProperties.email;
    
    formData.HOD = SP.FieldUserValue.fromUser(
      MainApplication.staffDetails[formData.EmployeeEmail].HodEmail,
    );
    formData.HODEmail =
      MainApplication.staffDetails[formData.EmployeeEmail].HodEmail;
    formData.Division =
      MainApplication.staffDetails[formData.EmployeeEmail].Department;

    formData.Title = CurrentUserProperties.title;
    globalDefinitions.callLoader();

    formData = customWorkflowEngine.routeEngine(customWorkflowEngine).runRouting(formData, AppRequest.defaultStage, globalDefinitions.stageDefinitions.save);
    formData.Approval_Status = globalDefinitions.stageDefinitions.save;
    formData.Current_Approver = globalDefinitions.stageDefinitions.employee;
    globalDefinitions.onActionCompleted();
    console.log("Data at SaveAsDraft: ", formData);
    MainApplication.NewRequestComponent.proceedToList(formData, false);
} else {
    globalDefinitions.HandlerError("Please fill the Process Overview part at least");
    globalDefinitions.onActionFailed();
}
  // console.log("Form Data to be submitted:", formData);
}
MainApplication.NewRequestComponent.proceedToList = function (formData) {
  
	var Attachments = $spcontext.grabAllAttachments();
	//used to grab all string links so that it can be updated.
	//mostly used when return for more information is part of the workflow process
	AppRequest.FileUrls = $spcontext.grabAllAttachmentsLinks();
	globalDefinitions.uploadAttachment(speedctxRoot, Attachments, globalDefinitions.stageDefinitions.foldername, globalDefinitions.stageDefinitions.documentlib, function () {
		if (AppRequest.itemId == null) {
      console.log("New data about to be created: ", formData);
			speedctxRoot.createItems([formData], globalDefinitions.stageDefinitions.listname, function (createdItemsProperties) {
				var itemID = createdItemsProperties[0].get_id();
				var updateObj = {};
				updateObj.ID = itemID;
				// var dateCreatedCode = $spcontext.stringnifyDate({
				// 	includeTime: true,
				// 	timeSpace: false,
				// 	format: "dd-mm-yy",
				// });
				// dateCreatedCode = itemID + "_" + dateCreatedCode.replace(/-/g, "");
				updateObj.WorkflowRequestID = globalDefinitions.stageDefinitions.workflowcode + itemID;

				AppRequest.requestDetails = formData;
				AppRequest.requestDetails.WorkflowRequestID = updateObj.WorkflowRequestID;
				if (!jQuery.isEmptyObject(AppRequest.AttachmentLoader)) {
					updateObj.Attachment_Folder = AppRequest.AttachmentLoader.Attachmentfolder;
					updateObj.AttachmentURL = AppRequest.AttachmentLoader.Attachmentlinks;
				}
        updateObj.RequestCreated = $spcontext.serverDate();
				updateObj.Year = $spcontext.serverDate().getFullYear();
        updateObj.Month = $spcontext.serverDate().getMonth();
				updateObj.LastTimeItemModifiedByWorklow = $spcontext.serverDate();
				updateObj.SLA_COUNT_UPDATED = "No";

				speedctxRoot.updateItems([updateObj], globalDefinitions.stageDefinitions.listname, function () {
          if (AppRequest.actionTaken === "submit") {
            globalDefinitions.HandlerSuccess(`Request submitted successfully`);
            $spcontext.redirect("#/", false);
            globalDefinitions.closeLoader();

            globalDefinitions.AuditLogManager_SaveLog({
              Action: `Submitted Request  ${AppRequest.requestDetails.WorkflowRequestID}`,
            });
					// });
          } else {
            globalDefinitions.HandlerSuccess(`Request saved as draft successfully`);
            $spcontext.redirect("#/", false);
            globalDefinitions.closeLoader();
            globalDefinitions.AuditLogManager_SaveLog({
              Action: `Saved Request  ${AppRequest.requestDetails.WorkflowRequestID}`,
            });
          }
				});
			});
		} else {
      console.log("New data about to be updated: ", formData);
			formData.ID = AppRequest.requestDetails.ID;
			formData.AttachmentURL = JSON.stringify(AppRequest.FileUrls);
      // formData.DateRequired = $spcontext.stringnifyDate({
      //     value: formData.DateRequired,
      //     includeTime: false,
      //     format: "dd/mm/yy",
      // });

			speedctxRoot.updateItems([formData], globalDefinitions.stageDefinitions.listname, function () {
				// if (AppRequest.requestDetails.ReturnForCorrection !== "Yes") {
				// 	AppRequest.requestDetails.Current_Approver = formData.Current_Approver;
				// }

				if (AppRequest.actionTaken === "submit") {
            globalDefinitions.HandlerSuccess(`Request submitted successfully`);
            $spcontext.redirect("#/", false);
            globalDefinitions.closeLoader();

            globalDefinitions.AuditLogManager_SaveLog({
              Action: `Submitted Request  ${AppRequest.requestDetails.WorkflowRequestID}`,
            });
					// });
          } else {
            globalDefinitions.HandlerSuccess(`Request saved as draft successfully`);
            $spcontext.redirect("#/", false);
            globalDefinitions.closeLoader();
            globalDefinitions.AuditLogManager_SaveLog({
              Action: `Saved Request  ${AppRequest.requestDetails.WorkflowRequestID}`,
            });
          }
			});
		}
    globalDefinitions.onActionCompleted();
	});
};



MainApplication.NewRequestComponent.recoverListData = function () {
  if (AppRequest.itemId !== null && AppRequest.itemId !== "") {
    var query = speedctxRoot.camlBuilder([
      {
        rowlimit: 1,
      },

      {
        operator: "Eq",
        field: "WorkflowRequestID",
        type: "Text",
        val: AppRequest.itemId,
      },
      {
        evaluator: "Or",
        operator: "Eq",
        field: "Approval_Status",
        type: "Text",
        val: globalDefinitions.stageDefinitions.save,
      },
      {
        evaluator: "Or",
        operator: "Eq",
        field: "Approval_Status",
        type: "Text",
        val: "Pending",
      },
    ]);

    var extraProperties = [
      "ID",
      "Title",
      "WorkflowRequestID",
      "Current_Approver",
      "Current_Approver_Code",
      "Approval_Status",

      "RequestCreated",
      "InitiatorEmailAddress",
      "InitiatorLogin",
      "Transaction_History",
      "ReturnForCorrection",

      "Modified",
      "PendingUserEmail",
      "PendingUserLogin",
      "Attachment_Folder",
      "AttachmentURL",
      "Comment",
      "HOD",
      "Division",
      "ProcessName",
      "Modified",
      "IsApprovalsNeeded",
      "ConditionalApproval",
      "RetentionPeriod",
      "Period",
      "DivisionsInvolved",
      "StepByStepProcess",
      "ExistingLink",
      "PainPoints",
      "CriteriaForCompletion",
      "IsProcessRelated",
      "PullDataFromAnotherSystem",
      "Approvers",
      "MaxApprovalTime",
      "RevokeUser",
      "ProcessOwner",
      "OtherFeatures",
      "ExtraFeatures",
      "Notifications",
      "UserAccess",
      "Reports",
      "Delegate",
      "RequirementStatement",
      "JustificationStatement",
      "DateRequired",
      "RelatedProcessInformation",
      "SystemInformation",
      "ConditionalApprovalInformation",
      "RequestType",
      "ModificationType",
      "CurrentFunctionality",
      "WhatShouldChange",
      "ModificationReason",
      "SystemsAffected",
      "IsOtherUsersNeeded",
      "ProposedStartDate",
      "EndDate",
      "UATDate",
      "Status",
      "Developer",
      "IsOtherUsersNeeded"
    ];

    speedctxRoot.getListToControl(
      globalDefinitions.stageDefinitions.listname,
      query,
      extraProperties,
      function (listProperties) {
        if (listProperties.RequestType === "New" || listProperties.ModificationType === "Major") {
          // MainApplication.NewRequestComponent.prepareAllTables();
          MainApplication.NewRequestComponent.toggleMainForm(true);
        }
        if ($.isEmptyObject(listProperties)) {
          MainApplication.notyf.error("Process does not exist...");
          $spcontext.redirect("#/", false);
          globalDefinitions.closeLoader();
        } else {
          // customWorkflowEngine.routeEngine(customWorkflowEngine).updateRoutesinFlow(listProperties, function (resolved) {
          //     customWorkflowEngine.routeEngine(customWorkflowEngine).PageSecurity(
          //         customWorkflowEngine.stages.securityModeView,
          //         listProperties.Current_Approver,
          //         listProperties.Approval_Status,
          //         function (error) {
                    // if (MainApplication.configuredTaskMembers[listProperties.Current_Approver].belongs) {

                    if (typeof error === "undefined") {
                      console.log("Recovering saved draft data:", listProperties);
                      listProperties.RequestCreated = $spcontext.stringnifyDate({
                        value: listProperties.RequestCreated,
                        includeTime: false,
                        format: "dd/mm/yy",
                      });

                      // <input type="date"> requires ISO yyyy-mm-dd - "dd/mm/yy"
                      // (the format ViewRequest's readonly textarea is fine with)
                      // gets silently rejected by the native date control, which
                      // is why the field wasn't rendering. Verify "yyyy-mm-dd" is
                      // a format string $spcontext.stringnifyDate actually
                      // recognizes; if not, format it manually here instead.
                      // stringnifyDate ignores the "yyyy-mm-dd" format request
                      // and always returns dd-mm-yyyy (confirmed: got back
                      // "08-08-2026") - so reorder its output ourselves rather
                      // than relying on the format param.
                      listProperties.DateRequired = $spcontext.stringnifyDate({
                        value: listProperties.DateRequired,
                        includeTime: false,
                        format: "dd/mm/yy",
                      });
                      listProperties.DateRequired = MainApplication.NewRequestComponent.toISODateInput(listProperties.DateRequired);

                      // Same reasoning as DateRequired above - DateRequired
                      // is also a native <input type="date"> and needs ISO yyyy-mm-dd.
                      // if (listProperties.DateRequired) {
                      //   listProperties.DateRequired = $spcontext.stringnifyDate({
                      //     value: listProperties.DateRequired,
                      //     includeTime: false,
                      //     format: "dd/mm/yy",
                      //   });
                      //   listProperties.DateRequired = MainApplication.NewRequestComponent.toISODateInput(listProperties.DateRequired);
                      // }

                      listProperties.StepByStepProcess = $spcontext.JSONToObject(listProperties.StepByStepProcess);
                      listProperties.Approvers = $spcontext.JSONToObject(listProperties.Approvers);
                      listProperties.Notifications = $spcontext.JSONToObject(listProperties.Notifications);
                      listProperties.UserAccess = $spcontext.JSONToObject(listProperties.UserAccess);
                      listProperties.Reports = $spcontext.JSONToObject(listProperties.Reports);
                      listProperties.DivisionsInvolved = $spcontext.JSONToObject(listProperties.DivisionsInvolved);
                      // NOT routed through MainApplication.buildReadOnlyData here -
                      // that reshapes each entry to {title, description, enabled,
                      // note} and drops "id", which is exactly what
                      // renderEditableExtraFeaturesTable needs to match a saved
                      // row back to the right checkbox. Keep the raw
                      // {id, enabled, note} shape that was actually saved.
                      listProperties.ExtraFeatures = $spcontext.JSONToObject(listProperties.ExtraFeatures);

                      listProperties.Transaction_History =
                        $spcontext.JSONToObject(
                          listProperties.Transaction_History,
                        );
                      listProperties.AttachmentURL = $spcontext.JSONToObject(
                        listProperties.AttachmentURL,
                        "object",
                      );

                      // was: listProperties.Delegate = listProperties.Delegate.email;
listProperties.Delegate = (listProperties.Delegate && (listProperties.Delegate.email || listProperties.Delegate.value)) || "";

                      AppRequest.FolderUrl = listProperties.Attachment_Folder;
                      AppRequest.FileUrls = $spcontext.deferenceObject(
                        listProperties.AttachmentURL,
                      );

                      for (var file in AppRequest.FileUrls) {
                        $spcontext.filesDictionary[file] = {
                          files: AppRequest.FileUrls[file],
                        };
                      }

                      // AppRequest.FileUrls = $spcontext.deferenceObject(listProperties.AttachmentURL);

                      if (listProperties.Transaction_History.length !== 0) {
                        $("#transaction-history").show();
                        globalDefinitions.displayHistory(
                          listProperties.Transaction_History,
                        );
                      }

                      MainApplication.NewRequestComponent.populateSelect2Editable(listProperties.DivisionsInvolved);
                      MainApplication.NewRequestComponent.renderEditableExtraFeaturesTable("extraFeaturesTable", listProperties.ExtraFeatures);
                      // if (listProperties.Current_Approver !== "Employee" && listProperties.Current_Approver_Code !== "AA1") {
                      // 	listProperties.Comment = "";
                      // }


                      AppRequest.requestDetails = listProperties;

                      // htmlBind only fills in elements that currently carry a
                      // speed-bind-validate attribute. #mainRequestFormWrapper
                      // starts hidden by default (see the page-load toggle call),
                      // which strips that attribute from EVERY field inside it -
                      // Period, ProcessName, RequirementStatement, all of it, not
                      // just the handful of conditional ones below. Left alone,
                      // htmlBind would run against a wrapper with no bindable
                      // fields and only the handful of fields we set manually
                      // further down would end up populated. Un-hiding (and so
                      // restoring those attributes) has to happen before htmlBind,
                      // not after.
                      const savedRequestType = listProperties.RequestType || "New";
                      MainApplication.NewRequestComponent.toggleRequestType(savedRequestType);
                      if (savedRequestType === "Modification") {
                        MainApplication.NewRequestComponent.toggleModificationType(listProperties.ModificationType);
                      }

                      $spcontext.htmlBind(listProperties);

                      // Dynamic tables (StepByStepProcess, Approvers, Notifications,
                      // UserAccess, Reports) aren't touched by htmlBind - they're
                      // managed separately through ctx.dynamicTableSettings. Without
                      // this, a returning Draft always shows the single blank row
                      // initializeDynamicTable() added on page load, regardless of
                      // what was actually saved.
                      try{
                        MainApplication.NewRequestComponent.hydrateDynamicTables({
                          StepByStepProcess: listProperties.StepByStepProcess,
                          Approvers: listProperties.Approvers,
                          Notifications: listProperties.Notifications,
                          UserAccess: listProperties.UserAccess,
                          Reports: listProperties.Reports,
                        });
                      } catch(error){};

                      // toggleApprovalStages/toggleOtherPeriod/toggleRetentionPeriod
                      // already ran once at page load, before any draft value existed,
                      // so whatever they decided then (fields hidden, nothing required)
                      // is stale. Re-run them now that the real saved values are bound,
                      // so a draft with IsApprovalsNeeded="Yes" or a custom Period
                      // actually shows the right section instead of staying hidden.
                      MainApplication.NewRequestComponent.toggleOtherPeriod(listProperties.Period);
                      MainApplication.NewRequestComponent.toggleRetentionPeriod(listProperties.RetentionPeriod);
                      MainApplication.NewRequestComponent.toggleApprovalStages();
                      MainApplication.NewRequestComponent.toggleOtherUsersNeeded();
                      MainApplication.NewRequestComponent.togglePullFromOtherSystem(listProperties.PullDataFromAnotherSystem);
                      MainApplication.NewRequestComponent.toggleRelatedProcess(listProperties.RelatedProcessInformation);

                      // Request Type / Modification Type were already resolved
                      // above, before htmlBind ran (that's what un-hides the
                      // wrapper in time for htmlBind to actually find its
                      // fields). No need to re-run it here.

                      // if (AppRequest.requestDetails.Current_Approver !== 'Employee'){
                      $spcontext.attachmentLinkBind(
                        listProperties.AttachmentURL,
                      );
                      // }
                      // $spcontext.assignAttributes();
                      // setTimeout(function () {

                        // was "#viewrequest-page" - leftover from copy-pasting
                        // ViewRequestComponent.recoverListData; NewRequest's page
                        // shell uses #newrequest-page (see NewRequest.tsx / the
                        // setTimeout below in whenNewRequestDependeciesLoaded).
                        
                        $("#conditionalApproval").val(listProperties.ConditionalApproval);
                        $("#maxApprovalTime").val(listProperties.MaxApprovalTime);
                        $('[speed-bind-validate="SystemInformation"]').val(listProperties.SystemInformation);
                        $('[speed-bind-validate="RelatedProcessInformation"]').val(listProperties.RelatedProcessInformation);
                        $("#requestType").val(listProperties.RequestType || "New");
                        if (listProperties.RequestType === "Modification") {
                          $("#modificationType").val(listProperties.ModificationType);
                          if (listProperties.ModificationType === "Minor") {
                            $('[speed-bind-validate="ProcessName"]').val(listProperties.ProcessName);
                            $('[speed-bind-validate="ExistingLink"]').val(listProperties.ExistingLink);
                            $('[speed-bind-validate="CurrentFunctionality"]').val(listProperties.CurrentFunctionality);
                            $('[speed-bind-validate="WhatShouldChange"]').val(listProperties.WhatShouldChange);
                            $('[speed-bind-validate="ModificationReason"]').val(listProperties.ModificationReason);
                            $('[speed-bind-validate="SystemsAffected"]').val(listProperties.SystemsAffected);
                            $('[speed-bind-validate="DateRequired"]').val(listProperties.DateRequired);
                          }
                        }
                        PeoplePicker.setDefault("Delegate", listProperties.Delegate);
                        PeoplePicker.initializePeoplePickers(MainApplication.staffList);
                        $("#newrequest-page").removeClass("hidden");
                        $("#newLoader").hide();
                        globalDefinitions.closeLoader();
                      // }, 2000);
                    } else {
                      globalDefinitions.HandlerError(
                        "You are not allowed to access this request",
                      );
                      globalDefinitions.AuditLogManager_SaveLog({
                        Action: `Unauthorized action on ${listProperties.WorkflowRequestID}`,
                        Message: "User is not allowed to view this request",
                      });
                      // setTimeout(function () {
                        globalDefinitions.closeLoader();
                      // }, 1000);
                      $spcontext.redirect("#/", false);
                    }

                    // }
            //       },
            //     ); //commented here
            // }); //commented here
        }
      },
    );
  } else {
    globalDefinitions.closeLoader();
    MainApplication.notyf.error("Invalid Request...");
    $spcontext.redirect("#/", false);
  }
};

MainApplication.NewRequestComponent.renderAttachments = function (elementBindProperty, property, elementId) {

    const container = $("div[speed-file-bind='" + elementBindProperty + "']");
    const files = $spcontext.filesDictionary[property]?.files || [];

    container.empty();

    files.forEach((file, index) => {

        let fileName, fileUrl = null;

        if (typeof file === "string") {
            fileUrl = file;
            fileName = file.split("/").pop();
        } else {
            fileName = file.dataName;
        }

        const $p = $("<p>", {
            id: `${elementBindProperty}display${index}`,
            css: { color: "#002c4d" }
        });

        if (fileUrl) {
            $("<a>", {
                href: fileUrl,
                text: fileName,
                target: "_blank"
            }).appendTo($p);
        } else {
            $p.text(fileName);
        }

        const $deleteBtn = $("<a>", {
            href: "#",
            text: " x",
            class: "attachment-inline-delete",
            "data-element": elementBindProperty,
            "data-index": index,
            "data-fileid": elementId,
            css: {
                color: "red",
                cursor: "pointer",
                paddingLeft: "5px"
            }
        });

        $p.append($deleteBtn);
        container.append($p);
    });
};

MainApplication.NewRequestComponent.deleteRowAttachment = function (elementBindProperty, index, elementId) {

    const el = document.getElementById(elementId);

    let property =
        el.getAttribute("speed-file-validate") ||
        el.getAttribute("speed-file-bind");

    const fileStore = $spcontext.filesDictionary[property];

    if (!fileStore || !Array.isArray(fileStore.files)) return;

    // Remove file safely
    fileStore.files.splice(index, 1);

    // Clear input (important for re-uploading same file)
    $spcontext.clearFileInput(elementId);

    // Re-render UI
    MainApplication.NewRequestComponent.renderAttachments(
        elementBindProperty,
        property,
        elementId
    );
};

MainApplication.NewRequestComponent.clearAllAttachments = function (elementBindProperty, elementId) {

    const el = document.getElementById(elementId);

    let property =
        el.getAttribute("speed-file-validate") ||
        el.getAttribute("speed-file-bind");

    const fileStore = $spcontext.filesDictionary[property];

    if (!fileStore || !Array.isArray(fileStore.files)) return;

    // Drain the array the same way deleteRowAttachment does it (splice), 
    // but all at once instead of one by one
    fileStore.files.splice(0, fileStore.files.length);

    // Clear the actual file input
    $spcontext.clearFileInput(elementId);

    // Re-render UI (will render empty since files array is now empty)
    MainApplication.NewRequestComponent.renderAttachments(
        elementBindProperty,
        property,
        elementId
    );
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

  if (!AppRequest.actionItems.length) {
    $container.empty();
    return;
  }

  let rows = "";

  AppRequest.actionItems.forEach(function (item, index) {
    rows += `
      <tr>
        <td>${MainApplication.NewRequestComponent.escapeHtml(item.Name)}</td>
        <td>${MainApplication.NewRequestComponent.escapeHtml(item.Email || "—")}</td>
        <td>${MainApplication.NewRequestComponent.escapeHtml(item.Task)}</td>
        <td>${MainApplication.NewRequestComponent.escapeHtml(item.DueDate)}</td>
        <td>${MainApplication.NewRequestComponent.escapeHtml(item.ActionPlan)}</td>
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
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
  `);
};

