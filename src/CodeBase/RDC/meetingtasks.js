loadMeetingTasksComponent = function () {
  if (MainApplication.cachedState.mode) {
    whenMeetingTasksDependeciesLoaded();
  } else {
    MainApplication.cachedState.pageStateCall = loadMeetingTasksComponent;
  }
};

var AppRequest;

MainApplication.MeetingTasksComponent.ApplicationDetails = function () {
  this.fullTableData = [];
  this.dataForExport = [];
}

whenMeetingTasksDependeciesLoaded = function () {
  // console.log("MeetingTasks Dependencies Loaded");
  globalDefinitions.sortResponse();

  // $("#requeststrDate").datepicker({ dateFormat: 'yy-mm-dd', beforeShow: function () { jQuery(this).datepicker('option', 'maxDate', $('#requestendDate').val()); } });
  // $("#requestendDate").datepicker({ dateFormat: 'yy-mm-dd', beforeShow: function () { jQuery(this).datepicker('option', 'minDate', $('#requeststrDate').val()); } });
  AppRequest = new MainApplication.MeetingTasksComponent.ApplicationDetails();
  AppRequest.fullTableData = [];
  AppRequest.dataForExport = [];


  speedctxRoot.DataForTable.tablecontentId = "speed-data-table";
  speedctxRoot.DataForTable.pagesize = 20;
  speedctxRoot.DataForTable.paginateSize = 5;
  speedctxRoot.DataForTable.modifyTR = false;
  speedctxRoot.DataForTable.context = speedctxRoot;
  speedctxRoot.DataForTable.paginationbId = "myrequestpagination";
  speedctxRoot.DataForTable.paginationuId = "toppagination";

  speedctxRoot.DataForTable.propertiesHandler = {
    Task: function (valueToEva) {
      var viewStr = `
                <a href="#/viewtask?itemId=${valueToEva.ReferenceID}">
                    ${valueToEva.Task}
                </a>`;

      return viewStr;
    },
    DueDate: function (valueToEva) {
      return $spcontext.stringnifyDate({
        value: valueToEva.DueDate,
        includeTime: false,
        format: "dd/mm/yy",
      });
    }
  };

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

  MainApplication.MeetingTasksComponent.retrieveRequest();

};

MainApplication.MeetingTasksComponent.retrieveRequest = function () {

  var name1 = MainApplication.staffDetails[CurrentUserProperties.email].Title;
  var name2 = MainApplication.staffDetails[CurrentUserProperties.email].Department;
  var query = `<View Scope="RecursiveAll">
    <Query>
      <Where>
        <Or>
          <Eq>
            <FieldRef Name="Name"/>
            <Value Type="Text">${name1}</Value>
          </Eq>
          <Eq>
            <FieldRef Name="Name"/>
            <Value Type="Text">${name2}</Value>
          </Eq>
        </Or>
      </Where>
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
      "Name",
      "Email",
      "Task",
      "DueDate",

      "ActionPlan",
      "ReferenceID",
      "Status",

      "Modified",
    ],
  };

  speedctxRoot.getListToItems(
    "MeetingNoteTasks",
    query,
    extraProperties,
    true,
    null,
    function (tableData) {
      console.log("Table Data: ", tableData);
      AppRequest.fullTableData = tableData;

      var completedItems = tableData.filter(function (item) {
        return item.Status === "Completed";
      });

      var pendingItems = tableData.filter(function (item) {
        return item.Status === "In Progress";
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
  $("#meetingtasks-page").removeClass("hidden");
  globalDefinitions.closeLoader();
};

MainApplication.MeetingTasksComponent.exportToExcel = function () {
  var excelName =
    "MeetingNoteTasks" + $spcontext.stringnifyDate() + ".csv";
  var dataStringHeader = [
    "Description",
    "Task Category",
    "Due Date",
    "Status",
  ];

  var excelData = dataStringHeader.toString() + "\n";

  $.each(AppRequest.dataForExport, function (index, itemProperties) {
    var dataString = [];
    dataString.push(itemProperties.Task);
    dataString.push(itemProperties.Title);
    dataString.push(
      $spcontext.stringnifyDate({
        value: itemProperties.DueDate,
        includeTime: false,
      }),
    );
    dataString.push(itemProperties.Status);

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
