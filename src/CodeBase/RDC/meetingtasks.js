loadMeetingTasksComponent = function () {
  if (MainApplication.cachedState.mode) {
    // whenMeetingTasksDependeciesLoaded();
    meetingTasks();
  } else {
    MainApplication.cachedState.pageStateCall = loadMeetingTasksComponent;
  }
};

// var AppRequest;

// var customWorkflowEngine;

// MainApplication.MeetingTasksComponent.ApplicationDetails = function () {
//   this.url = window.location.href;
//   this.itemId = null;
//   this.mode = null;
//   this.requestDetails = {};
//   this.Attachments = [];
//   this.FileUrls = {};
//   this.FolderUrl = "";
//   this.AttachmentLoader = {};
//   this.messageTemplate = {};
//   this.feedback = false;
//   this.approverComments = "";
//   this.transactionHistory = [];
//   this.defaultStage = "AA0";
//   this.returned = null;
//   this.sectionArr = [];
//   this.sections = {};
//   this.finalrating = [];
//   this.questionSetCounter = 0;
//   this.groupProperties = {};
//   this.nonConformanceCounter = 1;
// };
meetingTasks = function () {
  $("#newLoader").hide();
  $("#meetingtasks-page").removeClass('hidden');
  console.log("Meeting Tasks Page loaded");
}
whenMeetingTasksDependeciesLoaded = function () {
  // console.log("MeetingTasks Dependencies Loaded");
  // globalDefinitions.callLoader();
  globalDefinitions.extendStages();
  globalDefinitions.sortResponse();

  // $("#requeststrDate").datepicker({ dateFormat: 'yy-mm-dd', beforeShow: function () { jQuery(this).datepicker('option', 'maxDate', $('#requestendDate').val()); } });
  // $("#requestendDate").datepicker({ dateFormat: 'yy-mm-dd', beforeShow: function () { jQuery(this).datepicker('option', 'minDate', $('#requeststrDate').val()); } });
  AppRequest = new MainApplication.NewRequestComponent.ApplicationDetails();
  AppRequest.fullTableData = [];
  AppRequest.dataForExport = [];

  customWorkflowEngine = new WorkflowManagerEngine(CurrentUserProperties);

  speedctxRoot.DataForTable.tablecontentId = "speed-data-table";
  speedctxRoot.DataForTable.pagesize = 20;
  speedctxRoot.DataForTable.paginateSize = 5;
  speedctxRoot.DataForTable.modifyTR = false;
  speedctxRoot.DataForTable.context = speedctxRoot;
  speedctxRoot.DataForTable.paginationbId = "myrequestpagination";
  speedctxRoot.DataForTable.paginationuId = "toppagination";

  speedctxRoot.DataForTable.propertiesHandler = {
    Modified: function (valueToEva) {
      var viewStr = `
                <a href="#/viewrequest?itemId=${valueToEva.WorkflowRequestID}" class="btn btn-sm btn-primary btn-icon">
                    <i class="fa-solid fa-eye" style="font-size:11px"></i>
                </a>`;

      return viewStr;
    },
  };

  // $("#searchbtn").click(() => {
  //     MainApplication.MeetingTasksComponent.retrieveRequest();
  // });

  // let debounceTimer;

  $("#status-filter").on("keyup change", function () {
    var searchQuery = $(this).val();
    var data = AppRequest.fullTableData || [];
    var filteredItems = MainApplication.reportSyncSearch(searchQuery, data);
    MainApplication.MeetingTasksComponent.showTableData(filteredItems);
  });

  $("#exportToExcel").click(() => {
    MainApplication.MeetingTasksComponent.exportToExcel();
  });

  $("#searchInput").on("keyup", function () {
    var searchQuery = $(this).val();
    var data = AppRequest.fullTableData || [];
    var filteredItems = MainApplication.reportSyncSearch(searchQuery, data);
    MainApplication.MeetingTasksComponent.showTableData(filteredItems);
  });



  // if (MainApplication.isUserAnActor) {
    MainApplication.MeetingTasksComponent.retrieveRequest();
  // } else {
  //   globalDefinitions.HandlerError(
  //     "You are not authorized to access this page...",
  //   );
  //   $spcontext.redirect("#/", false);
  //   globalDefinitions.closeLoader();
  // }
  // setTimeout(function () {
  //     globalDefinitions.closeLoader();
  //     $("#report-page").addClass("active");
  //     $("#newLoader").hide();
  // }, 2000);
};

MainApplication.MeetingTasksComponent.retrieveRequest = function () {
  // globalDefinitions.callLoader();
  // var reportQuery = [
  //   {
  //     ascending: "FALSE",
  //     orderby: "Modified",
  //     viewScope: "RecursiveAll",
  //   },
  // ];

  // reportQuery = speedctxRoot.formQueryArrayGenerator(reportQuery);

  // var query = speedctxRoot.camlBuilder(reportQuery);
  var query = `<View Scope="RecursiveAll">
               <Query>
                 <OrderBy>
                   <FieldRef Name="Modified" Ascending="FALSE"/>
                 </OrderBy>
               </Query>
             </View>`;
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
      "MeetingTaskss",
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
      console.log("Table Data: ", tableData);
      AppRequest.fullTableData = tableData;

      var completedItems = tableData.filter(function (item) {
        return item.Approval_Status === "Completed";
      });

      var pendingItems = tableData.filter(function (item) {
        return item.Approval_Status === "Pending";
      });
      

      $("#totalRequest").text(tableData.length);
      $("#pendingRequest").text(pendingItems.length);
      $("#completedRequest").text(completedItems.length);

      MainApplication.MeetingTasksComponent.showTableData(tableData);
    },
  );
};

MainApplication.MeetingTasksComponent.showTableData = function (tableData) {
  AppRequest.dataForExport = tableData;
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
  $("#newLoader").hide();
  $("#report-page").removeClass("hidden");
  globalDefinitions.closeLoader();
};

MainApplication.MeetingTasksComponent.exportToExcel = function () {
  var excelName =
    "AppDeveklopmentMeetingTasks" + $spcontext.stringnifyDate() + ".csv";
  var dataStringHeader = [
    "Ref ID",
    "Process Name",
    "Requestor",
    "Division",
    "Next Approver",
    "Status",
  ];

  var excelData = dataStringHeader.toString() + "\n";

  $.each(AppRequest.dataForExport, function (index, itemProperties) {
    var dataString = [];
    dataString.push(itemProperties.WorkflowRequestID);
    dataString.push(itemProperties.ProcessName);
    dataString.push(itemProperties.Title);
    dataString.push(itemProperties.Division);
    dataString.push(itemProperties.Current_Approver);
    dataString.push(itemProperties.Approval_Status);

    // dataString.push(
    //   $spcontext.stringnifyDate({
    //     value: itemProperties.DateOfViolation,
    //     includeTime: false,
    //   }),
    // );
    // dataString.push(itemProperties.Severity);
    // dataString.push(itemProperties.Location);

    /*
        dataString.push(delegateEmail);*/
    excelData += dataString.toString() + "\n";
    excelData = "\uFEFF" + excelData;
  });

  MainApplication.MeetingTasksComponent.downloadData(excelName, excelData);
};

MainApplication.MeetingTasksComponent.downloadData = function (excelname, data) {
  if (navigator.msSaveOrOpenBlob) {
    var blobContent = data;
    // Works for Internet Explorer and Microsoft Edge
    var blob = new Blob([blobContent], { type: "text/csv" });
    navigator.msSaveOrOpenBlob(blob, excelname);
  } else {
    var encodedString;
    var downloadLink;
    try {
      encodedString = btoa(data);
      downloadLink = `data:text/csv;base64,${encodedString}`;
    } catch (e) {
      var csvContent = "data:text/csv;charset=utf-8,";
      csvContent += data;
      var blob = new Blob([data]);
      if (blob.size > 2000000) {
        globalDefinitions.HandlerError(
          "Please use the filter to reduce the data size, as the size of the data exceeds 2MB",
        );
      }
      downloadLink = encodeURI(csvContent);
    }

    var link = document.createElement("a");
    link.setAttribute("href", downloadLink);
    link.setAttribute("download", excelname);
    link.click();
  }
};

MainApplication.MeetingTasksComponent.validateCSVContent = function (data) {
  if (typeof data == "string") {
    //data = data.replace(/,/g, "~");
    data = data.replace(/\n/g, "");
    data = data.replace(/\r/g, "");
    data = data.replace(/\r\n/g, "");
    data = MainApplication.MeetingTasksComponent.encloseStringWithCommaCheck(data);
  }
  return data;
};

MainApplication.MeetingTasksComponent.encloseStringWithCommaCheck = function (value) {
  if (value.includes(",")) {
    return '"' + value + '"';
  }
  return value;
};

MainApplication.MeetingTasksComponent.updateDateConstraints = function () {
  var startDate = $("#requeststrDate").val();
  var endDate = $("#requestendDate").val();
  if (startDate) {
    $("#requestendDate").attr("min", startDate);
  } else {
    $("#requestendDate").removeAttr("min");
  }

  if (endDate) {
    $("#requeststrDate").attr("max", endDate);
  } else {
    $("#requeststrDate").removeAttr("max");
  }
};
