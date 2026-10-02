loadApproveRequestComponent = function () {
  if (MainApplication.cachedState.mode) {
    whenApproveRequestDependeciesLoaded();
  } else {
    MainApplication.cachedState.pageStateCall = loadApproveRequestComponent;
  }
};

var AppRequest;
var customWorkflowEngine;

MainApplication.ApproveRequestComponent.ApplicationDetails = function () {
  this.url = window.location.href;
  this.itemId = null;
  this.requestDetails = {};
  this.Attachments = [];
  this.FileUrls = {};
  this.FolderUrl = "";
  this.AttachmentLoader = {};
  this.messageTemplate = {};
  this.feedback = false;
  this.approverComment = "";
  this.transactionHistory = [];
  this.defaultStage = "AA1";
  this.returned = false;
  this.messageType = "standard";
  this.documentsToUpdate = {};
  this.mode = null;
};

whenApproveRequestDependeciesLoaded = function () {
  // globalDefinitions.callLoader();
  globalDefinitions.extendStages();
  $spcontext.assignAttributes();

  $spcontext.filesDictionary = {};

  $spcontext.validationProperties.text.extend["Comment"] = function (field) {
    var passed = false;
    if (
      (field.trim() !== "" &&
        (AppRequest.actionTaken ===
          globalDefinitions.stageDefinitions.decline ||
          AppRequest.actionTaken ===
            globalDefinitions.stageDefinitions.correction ||
          AppRequest.actionTaken === "Revise")) ||
      AppRequest.actionTaken === globalDefinitions.stageDefinitions.approve
    )
      passed = true;
    return passed;
  };

  AppRequest = new MainApplication.ApproveRequestComponent.ApplicationDetails();
  globalDefinitions.extendStages();
  customWorkflowEngine = new WorkflowManagerEngine(CurrentUserProperties);
  globalDefinitions.SetWorkflowRouting(customWorkflowEngine);
  AppRequest.itemId = $spcontext.getParameterByName(
    "itemid",
    window.location.href,
  );
  AppRequest.mode = $spcontext.getParameterByName("mode", window.location.href);

  $spcontext.filesDictionary = {};

  $spcontext.validationProperties.text.extend["Comment"] = function (field) {
    var passed = false;
    if (
      (field.trim() !== "" &&
        (AppRequest.actionTaken ===
          globalDefinitions.stageDefinitions.decline ||
          AppRequest.actionTaken ===
            globalDefinitions.stageDefinitions.correction ||
          AppRequest.actionTaken === "Revise")) ||
      AppRequest.actionTaken === globalDefinitions.stageDefinitions.approve
    )
      passed = true;
    return passed;
  };

  $spcontext.applyValidationEvents();
  MainApplication.ApproveRequestComponent.recoverListData();
  // setTimeout(function () {
  // 	globalDefinitions.closeLoader();
  // }, 2000);
};

MainApplication.ApproveRequestComponent.recoverListData = function () {
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
        operator: "Eq",
        field: "Approval_Status",
        type: "Text",
        val: globalDefinitions.stageDefinitions.pending,
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
        if ($.isEmptyObject(listProperties)) {
          MainApplication.notyf.error(
            "This process is not pending approval...",
          );
          $spcontext.redirect("#/", false);
          globalDefinitions.closeLoader();
        } else {
          customWorkflowEngine
            .routeEngine(customWorkflowEngine)
            .updateRoutesinFlow(listProperties, function (resolved) {
              customWorkflowEngine
                .routeEngine(customWorkflowEngine)
                .PageSecurity(
                  customWorkflowEngine.stages.securityModeTask,
                  listProperties.Current_Approver,
                  listProperties.Approval_Status,
                  function (error) {
                    // if (MainApplication.configuredTaskMembers[listProperties.Current_Approver].belongs) {

                    if (typeof error === "undefined") {
                      if (listProperties.Current_Approver_Code === "AA3") {
                        MainApplication.ApproveRequestComponent.renderModificationPeoplePicker(
                          {
                            pickerId: "Developer",
                            label: "Developer",
                            placeholder: "Select a Developer",
                          },
                        );
                        $("#devApproverSection").html(`
                            <div class="AdrFormGrid top-space">
                                <label class="AdrField">
                                    <span>
                                        Proposed Start Date
                                        <span class="required">*</span>
                                    </span>
                                    <input type="date" class="approval-data" speed-validate-msg="Please select a proposed start date" speed-bind-validate="ProposedStartDate" speed-bind-class="Dev" />
                                </label>

                                <label class="AdrField">
                                    <span>
                                        End Date
                                        <span class="required">*</span>
                                    </span>
                                    <input type="date" class="approval-data" speed-validate-msg="Please select a proposed end date" speed-bind-validate="EndDate" speed-bind-class="Dev" />
                                </label>

                            </div>
                        `);
                        const startEl = document.querySelector('[speed-bind-validate="ProposedStartDate"]');
                        const endEl   = document.querySelector('[speed-bind-validate="EndDate"]');
                        MainApplication.DateConstraints.linkStartAndEnd(startEl, endEl);
                      }
                      if (listProperties.Current_Approver_Code === "AA4") {
                        MainApplication.ApproveRequestComponent.renderModificationPeoplePickerReadonly(
                          {
                            pickerId: "Developer",
                            label: "Developer",
                            placeholder: "Select a Developer",
                            defaultValue: listProperties.PendingUserLogin
                          },
                        );
                        $("#devApproverSection").html(`
                            <div class="AdrFormGrid top-space">
                                <label class="AdrField">
                                    <span>
                                        Proposed Start Date
                                    </span>
                                    <input type="text" readonly speed-bind="ProposedStartDate" speed-bind-class="Dev" />
                                </label>

                                <label class="AdrField">
                                    <span>
                                        End Date
                                    </span>
                                    <input type="text" readonly speed-bind="EndDate" speed-bind-class="Dev" />
                                </label>
                                <label class="AdrField">
                                    <span>
                                        Status
                                        <span class="required">*</span>
                                    </span>
                                    <select id="projectStatus" class="approval-data" speed-validate-msg="Please select a status" speed-bind-validate="Status" speed-bind-class="DevStatus">
                                      <option value="" selected >Select a status</option>
                                      <option value="Not Started">Not Started</option>
                                      <option value="In Progress">In Progress</option>
                                      <option value="Completed">Completed</option>
                                    </select>
                                </label>

                            </div>
                        `);
                      }
                      if (listProperties.Current_Approver_Code === "AA5") {
                        MainApplication.ApproveRequestComponent.renderModificationPeoplePickerReadonly(
                          {
                            pickerId: "Developer",
                            label: "Developer",
                            placeholder: "Select a Developer",
                            defaultValue: listProperties.PendingUserLogin
                          },
                        );
                        $("#devApproverSection").html(`
                            <div class="AdrFormGrid top-space">
                                <label class="AdrField">
                                    <span>
                                        Proposed Start Date
                                    </span>
                                    <input type="text" readonly speed-bind="ProposedStartDate" speed-bind-class="Dev" />
                                </label>

                                <label class="AdrField">
                                    <span>
                                        End Date
                                    </span>
                                    <input type="text" readonly speed-bind="EndDate" speed-bind-class="Dev" />
                                </label>
                                <label class="AdrField">
                                    <span>
                                        Status
                                    </span>
                                    <input type="text" readonly speed-bind="Status" speed-bind-class="Dev" />
                                </label>

                                <label class="AdrField">
                                    <span>
                                        Proposed UAT Date
                                        <span class="required">*</span>
                                    </span>
                                    <input type="date" class="approval-data" speed-validate-msg="Please select a date for the UAT"  speed-bind-validate="UATDate" speed-bind-class="UatData" />
                                </label>

                            </div>
                        `);

                        MainApplication.DateConstraints.applyBasicRules(
                          document.querySelector('[speed-bind-validate="UATDate"]')
                        );
                      }
                      if (listProperties.Current_Approver_Code === "AA6") {
                        MainApplication.ApproveRequestComponent.renderModificationPeoplePickerReadonly(
                          {
                            pickerId: "Developer",
                            label: "Developer",
                            placeholder: "Select a Developer",
                            defaultValue: listProperties.PendingUserLogin
                          },
                        );
                        $("#devApproverSection").html(`
                            <div class="AdrFormGrid top-space">
                                <label class="AdrField">
                                    <span>
                                        Proposed Start Date
                                    </span>
                                    <input type="text" readonly speed-bind="ProposedStartDate" speed-bind-class="Dev" />
                                </label>

                                <label class="AdrField">
                                    <span>
                                        End Date
                                    </span>
                                    <input type="text" readonly speed-bind="EndDate" speed-bind-class="Dev" />
                                </label>

                                <label class="AdrField">
                                    <span>
                                        Status
                                    </span>
                                    <input type="text" readonly speed-bind="Status" speed-bind-class="Dev" />
                                </label>
                                <label class="AdrField">
                                    <span>
                                        UAT Date
                                    </span>
                                    <input type="text" readonly speed-bind="UATDate" speed-bind-class="Dev" />
                                </label>
                   -         </div>
                        `);
                      }

                      if (listProperties.IsApprovalsNeeded === "No") {
                        $("#approvalStagesContainer").hide();
                      }

                      if (listProperties.IsOtherUsersNeeded === "No") {
                        $("#userAccessContainer").hide();
                      }
                      listProperties.ProposedStartDate = $spcontext.stringnifyDate({
                        value: listProperties.ProposedStartDate,
                        includeTime: false,
                        format: "dd/mm/yy",
                      });
                      listProperties.EndDate = $spcontext.stringnifyDate({
                        value: listProperties.EndDate,
                        includeTime: false,
                        format: "dd/mm/yy",
                      });
                      listProperties.UATDate = $spcontext.stringnifyDate({
                        value: listProperties.UATDate,
                        includeTime: false,
                        format: "dd/mm/yy",
                      });
                      listProperties.RequestCreated = $spcontext.stringnifyDate(
                        {
                          value: listProperties.RequestCreated,
                          includeTime: false,
                          format: "dd/mm/yy",
                        },
                      );
                      listProperties.DateRequired = $spcontext.stringnifyDate({
                        value: listProperties.DateRequired,
                        includeTime: false,
                        format: "dd/mm/yy",
                      });

                      listProperties.StepByStepProcess = $spcontext.JSONToObject(
                        listProperties.StepByStepProcess,
                      );
                      listProperties.Approvers = $spcontext.JSONToObject(
                        listProperties.Approvers,
                      );
                      listProperties.Notifications = $spcontext.JSONToObject(
                        listProperties.Notifications,
                      );
                      listProperties.UserAccess = $spcontext.JSONToObject(
                        listProperties.UserAccess,
                      );
                      listProperties.Reports = $spcontext.JSONToObject(
                        listProperties.Reports,
                      );
                      listProperties.DivisionsInvolved = $spcontext.JSONToObject(
                          listProperties.DivisionsInvolved,
                        );
                      listProperties.ExtraFeatures = $spcontext.JSONToObject(
                        listProperties.ExtraFeatures,
                      );
                      listProperties.ExtraFeatures = MainApplication.buildReadOnlyData(
                          listProperties.ExtraFeatures,
                        );

                      listProperties.Transaction_History = $spcontext.JSONToObject(
                          listProperties.Transaction_History,
                        );
                      listProperties.AttachmentURL = $spcontext.JSONToObject(
                        listProperties.AttachmentURL,
                        "object",
                      );

                      // was: listProperties.Delegate = listProperties.Delegate.value || "";
listProperties.Delegate = (listProperties.Delegate && listProperties.Delegate.value) || "";

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

                      if (listProperties.PullDataFromAnotherSystem === "Yes") {
                        MainApplication.renderField({
                          containerId: "pullDataContainer",
                          className: "top-space",
                          type: "textarea",
                          value: listProperties.SystemInformation,
                          rows: 6,
                          readonly: true,
                        });
                      }

                      if (listProperties.IsProcessRelated === "Yes") {
                        MainApplication.renderField({
                          containerId: "relatedProcessContainer",
                          className: "top-space",
                          type: "textarea",
                          value: listProperties.RelatedProcessInformation,
                          rows: 6,
                          readonly: true,
                        });
                      }

                      if (listProperties.ConditionalApproval === "Yes") {
                        MainApplication.renderField({
                          containerId: "approvalsContainer",
                          className: "top-space",
                          type: "textarea",
                          value: listProperties.ConditionalApprovalInformation,
                          rows: 6,
                          readonly: true,
                        });
                      }

                      // Request Type / Modification: for a Minor modification
                      // request only the description matters, so the rest of
                      // the read-only form stays hidden - same distinction the
                      // editable NewRequest form makes. Records saved before
                      // this field existed have no RequestType value - treat
                      // those as "New" so they still display the full form.
                      var savedRequestType =
                        listProperties.RequestType || "New";

                      if (savedRequestType === "Modification") {
                        MainApplication.renderField({
                          containerId: "modificationTypeContainer",
                          className: "top-space",
                          type: "textarea",
                          value: listProperties.ModificationType,
                          rows: 1,
                          readonly: true,
                        });

                        if (listProperties.ModificationType === "Minor") {
                          $("#minorModificationFields").removeClass("hidden");
                          MainApplication.renderField({
                            containerId: "modificationProcessNameContainer",
                            className: "top-space",
                            type: "textarea",
                            value: listProperties.ProcessName,
                            rows: 1,
                            readonly: true,
                          });

                          MainApplication.renderField({
                            containerId: "modificationApplicationLinkContainer",
                            className: "top-space",
                            type: "a",
                            href: listProperties.ExistingLink,
                            target: "_blank",
                            text: "View Application"
                          });

                          MainApplication.renderField({
                            containerId:
                              "modificationCurrentFunctionalityContainer",
                            className: "top-space",
                            type: "textarea",
                            value: listProperties.CurrentFunctionality,
                            rows: 4,
                            readonly: true,
                          });

                          MainApplication.renderField({
                            containerId:
                              "modificationWhatShouldChangeContainer",
                            className: "top-space",
                            type: "textarea",
                            value: listProperties.WhatShouldChange,
                            rows: 4,
                            readonly: true,
                          });

                          MainApplication.renderField({
                            containerId: "modificationReasonContainer",
                            className: "top-space",
                            type: "textarea",
                            value: listProperties.ModificationReason,
                            rows: 4,
                            readonly: true,
                          });

                          MainApplication.renderField({
                            containerId: "modificationSystemsAffectedContainer",
                            className: "top-space",
                            type: "textarea",
                            value: listProperties.SystemsAffected,
                            rows: 4,
                            readonly: true,
                          });

                          MainApplication.renderField({
                            containerId: "modificationDateNeededContainer",
                            className: "top-space",
                            type: "textarea",
                            value: listProperties.DateRequired,
                            rows: 1,
                            readonly: true,
                          });

                          $("#mainRequestFormWrapper").addClass("hidden");
                        } else {
                          $("#mainRequestFormWrapper").removeClass("hidden");
                        }
                      } else {
                        $("#mainRequestFormWrapper").removeClass("hidden");
                      }

                      MainApplication.populateSelect2(
                        listProperties.DivisionsInvolved,
                      );
                      MainApplication.renderReadOnlyTable(
                        "extraFeaturesTable",
                        listProperties.ExtraFeatures,
                      );
                      // if (listProperties.Current_Approver !== "Employee" && listProperties.Current_Approver_Code !== "AA1") {
                      // 	listProperties.Comment = "";
                      // }

                      AppRequest.requestDetails = listProperties;

                      $spcontext.htmlBind(listProperties);

                      // if (AppRequest.requestDetails.Current_Approver !== 'Employee'){
                      $spcontext.attachmentLinkBind(
                        listProperties.AttachmentURL,
                      );
                      // }
                      // $spcontext.assignAttributes();
                      // setTimeout(function () {
                      $("#newLoader").hide();
                      $("#approval-page").removeClass("hidden");
                      globalDefinitions.closeLoader();
                      // }, 2000);
                    } else {
                      globalDefinitions.HandlerError(
                        "You are not allowed to access this request",
                      );
                      globalDefinitions.AuditLogManager_SaveLog({
                        Action: `Unauthorized action on ${listProperties.WorkflowRequestID}`,
                        Message: "User is not allowed to act on this request",
                      });
                      setTimeout(function () {
                        globalDefinitions.closeLoader();
                      }, 1000);
                      $spcontext.redirect("#/", false);
                    }

                    // }
                  },
                ); //commented here
            }); //commented here
        }
      },
    );
  } else {
    globalDefinitions.closeLoader();
    MainApplication.notyf.error("Invalid Request...");
    $spcontext.redirect("#/", false);
  }
};

MainApplication.ApproveRequestComponent.confirmSubmit = function (actionTaken) {
  $("#confirmModal").modal("show");
  if (actionTaken === "Revise" || actionTaken === "Declined") {
    if (actionTaken === "Revise") {
      $("#approvercomment").removeAttr("speed-validate-msg");
      $("#approvercomment").attr(
        "speed-validate-msg",
        "Please tell us what information you require",
      );
    }

    if (actionTaken === "Declined") {
      $("#approvercomment").removeAttr("speed-validate-msg");
      $("#approvercomment").attr(
        "speed-validate-msg",
        "Please tell us why you want to decline this request!",
      );
    }
    // $("#targetCompletion, #implementationOwner").removeAttr("speed-bind-validate");
  }
  AppRequest.actionTaken = actionTaken;
  MainApplication.confirmAction =
    MainApplication.ApproveRequestComponent.actionConfirmed;
};

MainApplication.ApproveRequestComponent.actionConfirmed = function () {
  $("#confirmModal").modal("hide");
  MainApplication.ApproveRequestComponent.saveDataToList(
    AppRequest.actionTaken,
  );
};

MainApplication.ApproveRequestComponent.saveDataToList = function (actionTaken) {
  globalDefinitions.onActionClicked();

  const stageCode = AppRequest.requestDetails.Current_Approver_Code;
  const isApproved = actionTaken === "Approved";
  const isDeclined = actionTaken === "Declined";
  const isRevise  = actionTaken === "Revise";

  // ------------------------------------------------------------------
  // 0. Always restore original validation attributes first
  // ------------------------------------------------------------------
  // This makes the function safe no matter the order of button clicks
  $(".approval-data").each(function () {
    const bindAttr = $(this).attr("speed-binds");
    // Only restore if it currently has speed-bind and we previously moved it
    if (bindAttr && !$(this).attr("speed-bind-validate")) {
      $(this)
        .attr("speed-bind-validate", bindAttr)
        .removeAttr("speed-binds");
    }
  });

  // ------------------------------------------------------------------
  // 1. Dynamic validation preparation
  // ------------------------------------------------------------------
  // For Revise / Decline we convert speed-bind-validate → speed-bind
  // so those fields are collected but NOT validated.
  if (!isApproved) {
    $(".approval-data").each(function () {
      const validateAttr = $(this).attr("speed-bind-validate");
      if (validateAttr) {
        $(this)
          .attr("speed-binds", validateAttr)
          .removeAttr("speed-bind-validate");
      }
    });
  }

  // Always start with a clean error state
  $spcontext.clearValidation();

  // ------------------------------------------------------------------
  // 2. Collect formData (and run validation only when needed)
  // ------------------------------------------------------------------
  let formData = {};
  let people = {};
  let pickerValues = {};

  if (isApproved) {
    // Only Approve should enforce validation + stage-specific binding
    switch (stageCode) {
      case "AA3":
        formData = $spcontext.bind({}, "Dev");
        pickerValues = PeoplePicker.getValue() || {};
        people = PeoplePicker.getConfiguredValue() || {};
        formData.Developer = pickerValues.Developer || null;
        break;

      case "AA4":
        formData = $spcontext.bind({}, "DevStatus");
        break;

      case "AA5":
        formData = $spcontext.bind({}, "UatData");
        break;

      default:
        // AA1, AA2, AA6 – no extra fields required
        formData = {};
        break;
    }
  } else {
    // Revise / Decline → collect values but skip validation
    // (attributes already converted above)
    formData = {};
    var tempData = $spcontext.bind({});
  }

  // ------------------------------------------------------------------
  // 3. Stop if validation failed (only relevant for Approve)
  // ------------------------------------------------------------------
  if (!$spcontext.checkPassedValidation()) {
    globalDefinitions.HandlerError("", true);
    globalDefinitions.onActionFailed();
    return;
  }

  // ------------------------------------------------------------------
  // 4. Always capture the comment
  // ------------------------------------------------------------------
  AppRequest.comment = $("#approvercomment").val();
  formData.Comment = AppRequest.comment;

  // ------------------------------------------------------------------
  // 5. History message lookup
  // ------------------------------------------------------------------
  const historyMessages = {
    Approved: {
      AA1: "HOD Acknowledged",
      AA2: "Management Reviewed",
      AA3: "Product Manager assigned a Developer",
      AA4: "Developer updated the status",
      AA5: "Product Manager proposed UAT",
      AA6: "HOD acknowledged process completion",
    },
    Declined: {
      AA1: "HOD rejected the request",
      AA2: "Management rejected the request",
      AA3: "Product Manager rejected the request",
      AA4: "Developer rejected the request",
      AA5: "Product Manager rejected the request",
      AA6: "HOD rejected the request",
    },
    Revise: {
      AA1: "HOD needed more information",
      AA2: "Management needed more information",
      AA3: "Product Manager needed more information",
      AA4: "Developer needed more information",
      AA5: "Product Manager needed more information",
      AA6: "HOD needed more information",
    },
  };

  const historyActionMessage = historyMessages[actionTaken]?.[stageCode];

  if (!historyActionMessage) {
    MainApplication.notyf.error("You can't act on this request :(...");
    $spcontext.redirect("#/", false);
    return;
  }

  // ------------------------------------------------------------------
  // 6. Attach history
  // ------------------------------------------------------------------
  const historyProp = {
    stage: AppRequest.requestDetails.Current_Approver,
    comment: AppRequest.comment,
    action: historyActionMessage,
  };

  formData = customWorkflowEngine
    .routeEngine(customWorkflowEngine)
    .requestHistoryHandler(
      formData,
      AppRequest.requestDetails.Transaction_History,
      historyProp
    );

  // ------------------------------------------------------------------
  // 7. Routing / stage-specific logic
  // ------------------------------------------------------------------
  if (isApproved || isDeclined) {
    if (stageCode === "AA3") {
      // Developer is mandatory when approving at AA3
      const developerEmail = (people && people.Developer) || null;

      if (!developerEmail) {
        MainApplication.notyf.error("Please select a Developer");
        globalDefinitions.onActionFailed();
        return;
      }

      const staff = MainApplication.staffDetails[developerEmail];
      if (!staff) {
        console.error("No staffDetails entry for", developerEmail);
        MainApplication.notyf.error("Selected developer not found in staff list");
        globalDefinitions.onActionFailed();
        return;
      }

      customWorkflowEngine.updateStageByName({
        name: globalDefinitions.stageDefinitions.assigneddev,
        username: staff.Title,
        authenticationValue: developerEmail,
        emails: [developerEmail],
      });

      formData = customWorkflowEngine
        .routeEngine(customWorkflowEngine)
        .runRouting(formData, stageCode, actionTaken);
    }
    else if (stageCode === "AA4") {
      // Only advance when Status === "Completed"
      if (formData.Status === "Completed") {
        formData = customWorkflowEngine
          .routeEngine(customWorkflowEngine)
          .runRouting(formData, stageCode, actionTaken);
      } else {
        console.log("AA4 – Status is not Completed, skipping routing", formData);
      }
    }
    else {
      // Normal path for AA1, AA2, AA5, AA6
      formData = customWorkflowEngine
        .routeEngine(customWorkflowEngine)
        .runRouting(formData, stageCode, actionTaken);
    }
  }
  else if (isRevise) {
    // Send back to initiator
    formData.Current_Approver       = globalDefinitions.stageDefinitions.employee;
    formData.Current_Approver_Code  = "AA0";
    formData.PendingUserLogin       = AppRequest.requestDetails.InitiatorEmailAddress;
    formData.PendingUserEmail       = AppRequest.requestDetails.InitiatorEmailAddress;
    formData.Approval_Status        = "Pending";
    formData.ReturnForCorrection    = "Yes";
  }

  // ------------------------------------------------------------------
  // 8. Finish
  // ------------------------------------------------------------------
  console.log("Form Data to be submitted:", formData);
  globalDefinitions.onActionCompleted();
  MainApplication.ApproveRequestComponent.proceedToList(formData);
};

MainApplication.ApproveRequestComponent.proceedToList = function (formData) {
  globalDefinitions.callLoader();

  formData.ID = AppRequest.requestDetails.ID;

  speedctxRoot.updateItems(
    [formData],
    globalDefinitions.stageDefinitions.listname,
    function () {
      // AppRequest.requestDetails.Current_Approver = formData.Current_Approver;
      globalDefinitions.closeLoader();
      globalDefinitions.HandlerSuccess(
        `You have successfully taken action on this process`,
      );
      globalDefinitions.AuditLogManager_SaveLog({
        Action: `took action on Violation Notice ${AppRequest.requestDetails.WorkflowRequestID}`,
      });
      $spcontext.redirect("#/", false);
    },
  );
  globalDefinitions.closeLoader();
};

MainApplication.ApproveRequestComponent.renderModificationPeoplePicker = function ({
  pickerId = "Developer",
  label = "Developer",
  placeholder = "Select a Developer",
  multiple = false,
  defaultValue = null,
} = {}) {
  const container = document.getElementById("approverSection");

  if (!container) {
    console.error("#approverSection was not found.");
    return;
  }

  const wrapper = document.createElement("div");
  wrapper.className = "AdrFormGrid";

  wrapper.innerHTML = `
    <label
        for="${pickerId.toLowerCase()}"
        class="AdrField"
    >
      <span>
        ${label}
        <span class="required">*</span>
      </span>

      <select
          id="${pickerId.toLowerCase()}"
          class="js-select2 w-full px-3 sm:px-4 py-2 sm:py-3
                  placeholder-slate-400 focus:outline-none
                  focus:ring-2 focus:ring-primary-500
                  focus:border-transparent transition-all
                  text-sm sm:text-base
                  approval-data"
          custom-people="${pickerId}"
          speed-bind-validate="${pickerId}"
          speed-validate-mode="true"
          speed-include-control="true"
          speed-bind-class="Dev"
          speed-as-static="true"
          speed-validate-msg="Please select a Developer"
          control-value-type="people"
          disable-selection-order="false"
          placeholder="${placeholder}"
          ${multiple ? "multiple" : ""}
      ></select>
    </label>
  `;

  container.appendChild(wrapper);

  const picker = wrapper.querySelector(
    `[custom-people="${pickerId}"]`
  );

  // Set default value BEFORE initialization
  if (defaultValue) {
    PeoplePicker.setDefault(pickerId, defaultValue);
  }

  // Initialize PeoplePicker
  PeoplePicker.initializePeoplePickers(MainApplication.developers);

  // Reconfigure Select2
  const $picker = $(picker);

  if ($picker.hasClass("select2-hidden-accessible")) {
    $picker.select2("destroy");
  }

  $picker.select2({
    placeholder: placeholder,
    allowClear: true,
    minimumInputLength: 0,
    width: "100%"
  });
};

MainApplication.ApproveRequestComponent.renderModificationPeoplePickerReadonly = function ({
  pickerId = "Developer",
  label = "Developer",
  placeholder = "Select a Developer",
  multiple = false,
  defaultValue = null,
} = {}) {
  const container = document.getElementById("approverSection");

  if (!container) {
    console.error("#approverSection was not found.");
    return;
  }

  const wrapper = document.createElement("div");
  wrapper.className = "AdrFormGrid";

  wrapper.innerHTML = `
      <label
          for="${pickerId.toLowerCase()}"
          class="AdrField"
      >
      <span>
          ${label}
      </span>

      <select
          id="${pickerId.toLowerCase()}"
          class="js-select2 w-full px-3 sm:px-4 py-2 sm:py-3
                  placeholder-slate-400 focus:outline-none
                  focus:ring-2 focus:ring-primary-500
                  focus:border-transparent transition-all
                  text-sm sm:text-base"
          custom-people="${pickerId}"
          speed-bind="${pickerId}"
          speed-validate-mode="false"
          speed-include-control="true"
          speed-as-static="true"
          control-value-type="people"
          disable-selection-order="false"
          placeholder="${placeholder}"
          ${multiple ? "multiple" : ""}
      ></select>
      </label>
  `;

  container.appendChild(wrapper);

  const picker = wrapper.querySelector(`[custom-people="${pickerId}"]`);

  // 1. Initialize first
  PeoplePicker.initializePeoplePickers(MainApplication.developers);

  // 2. Set default AFTER initialization (so getValue / bind actually see it)
  if (defaultValue) {
    if (typeof PeoplePicker.setValue === "function") {
      PeoplePicker.setValue(pickerId, defaultValue);
    } else if (typeof PeoplePicker.setDefault === "function") {
      PeoplePicker.setDefault(pickerId, defaultValue);
    }

    // Force the underlying <select> so $spcontext.bind picks it up
    if (picker) {
      $(picker).val(defaultValue).trigger("change");
    }
  }

  // 3. Make it readonly / non-editable
  if (picker) {
    // Native disable
    picker.disabled = true;
    picker.setAttribute("readonly", "readonly");

    // If Select2 is in use (js-select2 class), also disable via Select2 API
    if (typeof $(picker).select2 === "function") {
      try {
        $(picker).select2("enable", false);
      } catch (e) {
        // Select2 may not be fully ready; fall back to CSS
        $(picker).next(".select2-container").css("pointer-events", "none");
        $(picker).next(".select2-container").addClass("select2-container--disabled");
      }
    }

    // Extra safety: block pointer events on the whole control
    $(picker).closest(".AdrField").css({
      "pointer-events": "none",
      opacity: "0.85",
    });
  }
};
