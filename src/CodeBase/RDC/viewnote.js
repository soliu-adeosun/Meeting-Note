loadViewNote = function () {
  if (MainApplication.cachedState.mode) {
    // whenViewNoteDependeciesLoaded();
    viewNote();
  } else {
    MainApplication.cachedState.pageStateCall = loadViewNote;
  }
};

var AppRequest;

var customWorkflowEngine;

MainApplication.ViewNote.ApplicationDetails = function () {
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
  this.nonConformanceCounter = 1;
};

viewNote = function () {
  console.log("ViewNote component loaded");
  $("#newLoader").hide();
  $("#viewnote-page").removeClass("hidden");
  globalDefinitions.closeLoader();
}
whenViewNoteDependeciesLoaded = function () {
  // globalDefinitions.callLoader();
  globalDefinitions.extendStages();
  globalDefinitions.sortResponse();
  AppRequest = new MainApplication.ViewNote.ApplicationDetails();
  AppRequest.pendingItems = [];
  AppRequest.myItems = [];
  // MainApplication.getNCOnQueue();
  customWorkflowEngine = new WorkflowManagerEngine(CurrentUserProperties);
  speedctxRoot.DataForTable.tablecontentId = "speed-data-table";
  speedctxRoot.DataForTable.pagesize = 20;
  speedctxRoot.DataForTable.paginateSize = 5;
  speedctxRoot.DataForTable.modifyTR = false;
  speedctxRoot.DataForTable.context = speedctxRoot;
  speedctxRoot.DataForTable.paginationbId = "myrequestpagination";
  speedctxRoot.DataForTable.paginationuId = "toppagination";
  speedctxRoot.DataForTable.propertiesHandler = {
    RequestCreated: function (valueToEva) {
      return $spcontext.stringnifyDate({
        value: valueToEva.RequestCreated,
        includeTime: false,
        format: "dd/mm/yy",
      });
    },

    Modified: function (valueToEva) {
      // var isActor = MainApplication.isUserAnActor;

      let isActor = false;

      try {
        isActor =
          CurrentUserProperties.email === valueToEva.PendingUserLogin ||
          MainApplication.configuredTaskMembers[valueToEva.Current_Approver]
            .belongs;
      } catch (error) {}

      var approvalStr = `

                                    ${
                                      isActor
                                        ? `
                <a title="Approve" href="#/approverequest?itemId=${valueToEva.WorkflowRequestID}" class="btn btn-sm btn-primary btn-icon">
                    <i class="fa-solid fa-pen" style="font-size:11px"></i>
                </a>` : ""}`;

      var editStr = `
                <a title="Modify" class="btn btn-sm btn-primary btn-icon" href="#/newrequest?itemId=${valueToEva.WorkflowRequestID}&mode=correction">
                  <i class="fa-solid fa-pen" style="font-size:11px"></i>
                </a>`;

      var editDraftStr = `
                <a title="Modify" class="btn btn-sm btn-primary btn-icon" href="#/newrequest?itemId=${valueToEva.WorkflowRequestID}&mode=editdraft">
                  <i class="fa-solid fa-pen" style="font-size:11px"></i>
                </a>`;

      var viewStr = `
                <a title="View" href="#/viewrequest?itemId=${valueToEva.WorkflowRequestID}" class="btn btn-sm btn-primary btn-icon">
                    <i class="fa-solid fa-eye" style="font-size:11px"></i>
                </a>`;

      if (
        valueToEva.Approval_Status === globalDefinitions.stageDefinitions.save
      ) {
        return `<div class="flex space-x-1 sm:space-x-2">${editDraftStr}</div>`;
      } else if (
        valueToEva.Approval_Status === "Pending" &&
        valueToEva.ReturnForCorrection === "Yes"
      ) {
        return `<div class="flex space-x-1 sm:space-x-2">${editStr}</div>`;
      } else if (
        valueToEva.Approval_Status === "Completed" ||
        valueToEva.Approval_Status === "Declined"
      ) {
        return `<div class="flex space-x-1 sm:space-x-2">${viewStr}</div>`;
      } else {
        return `<div class="flex space-x-1 sm:space-x-2">${approvalStr}</div>`;
      }
    },
  };

  $("#dashboard-tabs").empty();

  // if (MainApplication.isUserAnActor) {

  $("#dashboard-tabs").append(`
    <div class="dashboard-tabs">
        <button id="pendingTab" class="tab-btn active" data-tab="pending">
            Action Required
            <span id="auditsAwaitingMyAction">0</span>
        </button>
        <button id="myAuditsTab" class="tab-btn" data-tab="myAudits">
            My Requests
        </button>
    </div>
`);

  $(".tab-btn").on("click", function () {

    $(".tab-btn").removeClass("active");
    $(this).addClass("active");

    const tab = $(this).data("tab");

    switch (tab) {

        case "myAudits":
            MainApplication.ViewNote.currentTab = "MyAudits";
            MainApplication.ViewNote.showTableData(AppRequest.myItems);
            break;

        case "pending":
            MainApplication.ViewNote.currentTab = "Pending";
            MainApplication.ViewNote.showTableData(AppRequest.pendingItems);
            break;
    }

});

  // Fetch data for both tabs

  MainApplication.ViewNote.pendingRequests();

  MainApplication.ViewNote.myRequests();

  MainApplication.ViewNote.currentTab = "Pending";

  // if (
  //   MainApplication.configuredTaskMembers[
  //     globalDefinitions.stageDefinitions.management
  //   ].belongs
  // ) {
  //   $(".issue-new-nc-btn").show();
  // }

  setTimeout(function () {
    $("#newLoader").hide();
    $("#dashboard-page").removeClass("hidden");
    globalDefinitions.closeLoader();
  }, 2000);
};

MainApplication.ViewNote.pendingRequests = function () {
  var queryCaml = [
    {
      ascending: "FALSE",
      orderby: "Modified",
    },
    {
      operator: "Eq",
      field: "Approval_Status",
      type: "Text",
      val: "Pending",
    },

    // {

    //     operator: 'Eq',

    //     field: 'PendingUserLogin',

    //     type: 'Text',

    //     val: CurrentUserProperties.email

    // },
  ];

  if (
    MainApplication.configuredTaskMembers[
      globalDefinitions.stageDefinitions.management
    ].belongs
  ) {
    queryCaml.push({
      evaluator: "Or",
      operator: "Eq",
      field: "Current_Approver",
      type: "Text",
      val: globalDefinitions.stageDefinitions.management,
    });
  }

  if (
    MainApplication.configuredTaskMembers[
      globalDefinitions.stageDefinitions.ceo
    ].belongs
  ) {
    queryCaml.push({
      evaluator: "Or",
      operator: "Eq",
      field: "Current_Approver",
      type: "Text",
      val: globalDefinitions.stageDefinitions.ceo,
    });
  }

  if (globalDefinitions.stageDefinitions.employee) {
    queryCaml.push({
      evaluator: "Or",
      operator: "Eq",
      field: "PendingUserLogin",
      type: "Text",
      val: CurrentUserProperties.email,
    });
  }

  if (globalDefinitions.stageDefinitions.hod) {
    queryCaml.push({
      evaluator: "Or",
      operator: "Eq",
      field: "PendingUserLogin",
      type: "Text",
      val: CurrentUserProperties.email,
    });
  }

  queryCaml = customWorkflowEngine.setupTaskForGroups(queryCaml);

  var query = speedctxRoot.camlBuilder(queryCaml);

  var extraProperties = {
    merge: true,

    data: [
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
      "ReasonForAutomation",
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
      "RequirementStatement",
      "JustificationStatement",
      "DateRequired",
      "RelatedProcessInformation",
      "SystemInformation",
      "ConditionalApprovalInformation"
    ],
  };

  speedctxRoot.getListToItems(
    configProperties.APPDEVLIST.setting,
    query,
    extraProperties,
    true,
    null,
    function (tableData) {
      AppRequest.pendingItems = tableData;

      $("#auditsAwaitingMyAction").text(tableData.length);

      if (MainApplication.ViewNote.currentTab === "Pending") {
        MainApplication.ViewNote.showTableData(tableData);
      }
    },
  );
};

MainApplication.ViewNote.myRequests = function () {
  var queryToUse = [
    {
      ascending: "FALSE",

      orderby: "Modified",

      viewScope: "RecursiveAll",
    },
    {
      operator: "Eq",

      field: "EmployeeEmail",

      type: "Text",

      val: CurrentUserProperties.email,
    },
  ];

  var query = speedctxRoot.camlBuilder(queryToUse);

  var extraProperties = {
    merge: true,

    data: [
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
      "ReasonForAutomation",
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
      "ConditionalApprovalInformation"
    ],
  };

  speedctxRoot.getListToItems(
    configProperties.APPDEVLIST.setting,
    query,
    extraProperties,
    true,
    null,
    function (tableData) {
      var completedItems = tableData.filter(function (item) {
        return item.Approval_Status === "Completed" || item.Approval_Status === "Declined";
      });

      var pendingItems = tableData.filter(function (item) {
        return item.Approval_Status === "Pending";
      });

      var draftItems = tableData.filter(function (item) {
        return item.Approval_Status === "Draft";
      });

      AppRequest.myItems = tableData;

      // AppRequest.ncData = MainApplication.AuditList;
      var submittedItems = tableData.length - draftItems.length;

      $("#totalRequest").text(submittedItems);
      $("#pendingRequest").text(pendingItems.length);
      $("#completedRequest").text(completedItems.length);

      if (MainApplication.ViewNote.currentTab === "MyAudits") {
        MainApplication.ViewNote.showTableData(tableData);
      }
    },
  );
};

MainApplication.ViewNote.showTableData = function (tableData) {
  if (tableData.length === 0) {
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
  
  $("#dashboard-page").addClass("active");
  globalDefinitions.closeLoader();

};
