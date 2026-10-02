loadViewRequestComponent = function () {
  if (MainApplication.cachedState.mode) {
    whenViewRequestDependeciesLoaded();
  } else {
    MainApplication.cachedState.pageStateCall = loadViewRequestComponent;
  }
};

var AppRequest;
var customWorkflowEngine;

MainApplication.ViewRequestComponent.ApplicationDetails = function () {
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

whenViewRequestDependeciesLoaded = function () {
  // globalDefinitions.callLoader();
  // globalDefinitions.extendStages();
  $spcontext.assignAttributes();

  $spcontext.filesDictionary = {};

  AppRequest = new MainApplication.ViewRequestComponent.ApplicationDetails();
  globalDefinitions.extendStages();
  customWorkflowEngine = new WorkflowManagerEngine(CurrentUserProperties);
  globalDefinitions.SetWorkflowRouting(customWorkflowEngine);
  AppRequest.itemId = $spcontext.getParameterByName(
    "itemid",
    window.location.href,
  );


  $spcontext.filesDictionary = {};

    $spcontext.appliedEvents.attachments = [];
    $spcontext.applyAttachmentEvent({
        o365: true,
        appendFiles: true,
        cancelClear: false,
    }, function (elementName, listOfFiles, fileId) {
        $("div[speed-file-bind='" + elementName + "']").empty();

        if (listOfFiles.files.length !== 0) {
            for (var y = 0; y < listOfFiles.files.length; y++) {
                if (typeof listOfFiles.files[y] === "string") {
                    var splitedLinks = listOfFiles.files[y].split("/");
                    var pos = splitedLinks.length - 1;
                    displayName = splitedLinks[pos];
                    var attachmentBlock = "<p id='" + elementName + "display" + y + "' style='color : #002c4d'><a href='" + listOfFiles.files[y] + "'>" + displayName + "<span><a style='color: red; cursor: pointer; padding-left: 5px' class='attachment-inline-delete' onclick='MainApplication.WorkflowsComponent.BPMS.Onboarding.ApproveRequest.deleteRowAttachment(\"" + elementName + "\", " + y + ",\"" + fileId + "\")'>x</a></span></a></p>";
                    $("div[speed-file-bind='" + elementName + "']").append(attachmentBlock);
                } else {
                    var attachmentBlock = "<p id='" + elementName + "display" + y + "' style='color : #002c4d'>" + listOfFiles.files[y].dataName +
                        "<span><a class='attachment-inline-delete' style='color: red; cursor: pointer; padding-left: 5px' onclick='MainApplication.WorkflowsComponent.BPMS.ProcessInitiation.NewRequest.deleteRowAttachment(\"" + elementName + "\", " + y + ",\"" + fileId + "\")'>x</a></span></p>";
                    $("div[speed-file-bind='" + elementName + "']").append(attachmentBlock);
                }
            }
        }
    }, function (errors) {
        globalDefinitions.HandlerError(errors.msg, false);
    });
  $spcontext.applyValidationEvents();
  MainApplication.ViewRequestComponent.recoverListData();
  // setTimeout(function () {
  //   globalDefinitions.closeLoader();
  // }, 2000);
};

MainApplication.ViewRequestComponent.recoverListData = function () {
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
                      listProperties.RequestCreated = $spcontext.stringnifyDate({
                        value: listProperties.RequestCreated,
                        includeTime: false,
                        format: "dd/mm/yy",
                      });

                      listProperties.DateRequired = $spcontext.stringnifyDate({
                        value: listProperties.DateRequired,
                        includeTime: false,
                        format: "dd/mm/yy",
                      });

                      if (listProperties.IsApprovalsNeeded === "No") {
                        $("#approvalStagesContainer").hide();
                      }

                      if (listProperties.IsOtherUsersNeeded === "No") {
                        $("#userAccessContainer").hide();
                      }

                      listProperties.StepByStepProcess = $spcontext.JSONToObject(listProperties.StepByStepProcess);
                      listProperties.Approvers = $spcontext.JSONToObject(listProperties.Approvers);
                      listProperties.Notifications = $spcontext.JSONToObject(listProperties.Notifications);
                      listProperties.UserAccess = $spcontext.JSONToObject(listProperties.UserAccess);
                      listProperties.Reports = $spcontext.JSONToObject(listProperties.Reports);
                      listProperties.DivisionsInvolved = $spcontext.JSONToObject(listProperties.DivisionsInvolved);
                      listProperties.ExtraFeatures = $spcontext.JSONToObject(listProperties.ExtraFeatures);
                      listProperties.ExtraFeatures = MainApplication.buildReadOnlyData(listProperties.ExtraFeatures);

                      listProperties.Transaction_History =
                        $spcontext.JSONToObject(
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
                            readonly: true
                        });
                      }

                      if (listProperties.IsProcessRelated === "Yes") {
                        MainApplication.renderField({
                            containerId: "relatedProcessContainer",
                            className: "top-space",
                            type: "textarea",
                            value: listProperties.RelatedProcessInformation,
                            rows: 6,
                            readonly: true
                        });
                      }

                      if (listProperties.ConditionalApproval === "Yes") {
                        MainApplication.renderField({
                            containerId: "approvalsContainer",
                            className: "top-space",
                            type: "textarea",
                            value: listProperties.ConditionalApprovalInformation,
                            rows: 6,
                            readonly: true
                        });
                      }

                      // Request Type / Modification: for a Minor modification
                      // request only the description matters, so the rest of
                      // the read-only form stays hidden - same distinction the
                      // editable NewRequest form makes. Records saved before
                      // this field existed have no RequestType value - treat
                      // those as "New" so they still display the full form.
                      var savedRequestType = listProperties.RequestType || "New";

                      if (savedRequestType === "Modification") {

                        MainApplication.renderField({
                            containerId: "modificationTypeContainer",
                            className: "top-space",
                            type: "textarea",
                            value: listProperties.ModificationType,
                            rows: 1,
                            readonly: true
                        });

                        if (listProperties.ModificationType === "Minor") {
                          $("#minorModificationFields").removeClass("hidden");
                          MainApplication.renderField({
                              containerId: "modificationProcessNameContainer",
                              className: "top-space",
                              type: "textarea",
                              value: listProperties.ProcessName,
                              rows: 1,
                              readonly: true
                          });

                          MainApplication.renderField({
                              containerId: "modificationApplicationLinkContainer",
                              className: "top-space",
                              type: "textarea",
                              value: listProperties.ExistingLink,
                              rows: 1,
                              readonly: true
                          });

                          MainApplication.renderField({
                              containerId: "modificationCurrentFunctionalityContainer",
                              className: "top-space",
                              type: "textarea",
                              value: listProperties.CurrentFunctionality,
                              rows: 4,
                              readonly: true
                          });

                          MainApplication.renderField({
                              containerId: "modificationWhatShouldChangeContainer",
                              className: "top-space",
                              type: "textarea",
                              value: listProperties.WhatShouldChange,
                              rows: 4,
                              readonly: true
                          });

                          MainApplication.renderField({
                              containerId: "modificationReasonContainer",
                              className: "top-space",
                              type: "textarea",
                              value: listProperties.ModificationReason,
                              rows: 4,
                              readonly: true
                          });

                          MainApplication.renderField({
                              containerId: "modificationSystemsAffectedContainer",
                              className: "top-space",
                              type: "textarea",
                              value: listProperties.SystemsAffected,
                              rows: 4,
                              readonly: true
                          });

                          MainApplication.renderField({
                              containerId: "modificationDateNeededContainer",
                              className: "top-space",
                              type: "textarea",
                              value: listProperties.DateRequired,
                              rows: 1,
                              readonly: true
                          });

                          $("#mainRequestFormWrapper").addClass("hidden");

                        } else {
                          $("#mainRequestFormWrapper").removeClass("hidden");
                        }

                      } else {
                        $("#mainRequestFormWrapper").removeClass("hidden");
                      }

                      MainApplication.populateSelect2(listProperties.DivisionsInvolved);
                      MainApplication.renderReadOnlyTable("extraFeaturesTable", listProperties.ExtraFeatures);
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
                        $("#viewrequest-page").removeClass("hidden");
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

// MainApplication.ViewRequestComponent.buildViewOnlyInspectionTable = function () {
//     const data = AppRequest.retrievedtableData;
//     if (!data || !data.Monday || !data.Tuesday) {
//         console.warn("No inspection data available");
//         return;
//     }

//     // Get all unique items from Monday (assuming all days have same items)
//     const sampleDay = data.Monday;
//     const items = sampleDay.map(entry => {
//         return Object.keys(entry).find(key => key !== "Defect");
//     }).filter(Boolean);

//     let html = `
//             <thead>
//                 <tr>
//                     <th>S/N</th>
//                     <th>Inspection Items</th>
//                     <th>Monday</th>
//                     <th>Tuesday</th>
//                     <th>Wednesday</th>
//                     <th>Thursday</th>
//                     <th>Friday</th>
//                     <th>Defect / Notes</th>
//                 </tr>
//             </thead>
//             <tbody>
//     `;

//     items.forEach((item, index) => {
//         const defect = data.Monday.find(entry => entry[item])?.Defect || "Nil";

//         html += `
//             <tr>
//                 <td>${index + 1}</td>
//                 <td style="border:1px solid #ccc; padding:10px; text-align:left;">${item}</td>
//                 <td>${data.Monday.find(e => e[item])?.[item] === "Yes" ? "✔" : "✘"}</td>
//                 <td>${data.Tuesday.find(e => e[item])?.[item] === "Yes" ? "✔" : "✘"}</td>
//                 <td>${data.Wednesday.find(e => e[item])?.[item] === "Yes" ? "✔" : "✘"}</td>
//                 <td>${data.Thursday.find(e => e[item])?.[item] === "Yes" ? "✔" : "✘"}</td>
//                 <td>${data.Friday.find(e => e[item])?.[item] === "Yes" ? "✔" : "✘"}</td>
//                 <td>${defect}</td>
//             </tr>
//         `;
//     });

//     html += `</tbody>`;

//     // Insert into your page - CHANGE THIS SELECTOR to match your container
//     const container = document.getElementById("view-table");

//     if (container) {
//         container.innerHTML = html;
//     } else {
//         console.error("Could not find container to append table");
//         document.body.insertAdjacentHTML('beforeend', `<table>${html}</table>`);
//     }
// };