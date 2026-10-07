loadMyNotesComponent = function () {
  if (MainApplication.cachedState.mode) {
    whenMyNotesDependeciesLoaded();
  } else {
    MainApplication.cachedState.pageStateCall = loadMyNotesComponent;
  }
};

var AppRequest;

MainApplication.MyNotesComponent.ApplicationDetails = function () {
  this.fullTableData = [];
  this.dataForExport = [];
}

whenMyNotesDependeciesLoaded = function () {
  // console.log("MyNotes Dependencies Loaded");
  globalDefinitions.sortResponse();

  // $("#requeststrDate").datepicker({ dateFormat: 'yy-mm-dd', beforeShow: function () { jQuery(this).datepicker('option', 'maxDate', $('#requestendDate').val()); } });
  // $("#requestendDate").datepicker({ dateFormat: 'yy-mm-dd', beforeShow: function () { jQuery(this).datepicker('option', 'minDate', $('#requeststrDate').val()); } });
  AppRequest = new MainApplication.MyNotesComponent.ApplicationDetails();
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
    ReferenceID: function (valueToEva) {
      var viewStr = `
                <a class="brown-anchor" title="View Meeting Note" href="#/viewnote?itemId=${valueToEva.ReferenceID}">
                    ${valueToEva.ReferenceID}
                </a>`;
      var editStr = `
                <a class="brown-anchor" title="Edit Meeting Note" href="#/newmeetingnote?itemId=${valueToEva.ReferenceID}">
                    ${valueToEva.ReferenceID}
                </a>`;

      if (valueToEva.Status === "Submitted") {
        return viewStr;
      } else {
        return editStr;
      }
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
        return `<span class="vn-task-status is-completed">${valueToEva.Status}</span>`;
      }
      if (valueToEva.Status === "Draft") {
        return `<span class="vn-task-status is-notstarted">${valueToEva.Status}</span>`;
      }
    }
  };

  MainApplication.MyNotesComponent.populateMeetingTypeDropdown();

  $("#status-filter, #status-filter-type").on("keyup change", function () {
    var searchQuery = $(this).val();
    var data = AppRequest.fullTableData || [];
    var filteredItems = MainApplication.reportSyncSearch(searchQuery, data);
    MainApplication.MyNotesComponent.showTableData(filteredItems);
  });

  $("#exportToExcel").click(() => {
    MainApplication.MyNotesComponent.exportToExcel();
  });

  $("#searchInput").on("keyup", function () {
    var searchQuery = $(this).val();
    var data = AppRequest.fullTableData || [];
    var filteredItems = MainApplication.reportSyncSearch(searchQuery, data);
    MainApplication.MyNotesComponent.showTableData(filteredItems);
  });

  MainApplication.MyNotesComponent.retrieveRequest();

};

MainApplication.MyNotesComponent.retrieveRequest = function () {

  var currentUser = CurrentUserProperties.title;
  var query = `<View Scope="RecursiveAll">
    <Query>
        <Where>
            <Eq>
                <FieldRef Name="Reporter"/>
                <Value Type="Text">${currentUser}</Value>
            </Eq>
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

  speedctxRoot.getListToItems(
    configProperties.MTNNOTELIST.setting,
    query,
    extraProperties,
    true,
    null,
    function (tableData) {
      console.log("Table Data: ", tableData);
      AppRequest.fullTableData = tableData;

      var completedItems = tableData.filter(function (item) {
        return item.Status === "Submitted";
      });

      var pendingItems = tableData.filter(function (item) {
        return item.Status === "Draft";
      });
      

      $("#totalRequest").text(tableData.length);
      $("#pendingRequest").text(pendingItems.length);
      $("#completedRequest").text(completedItems.length);

      MainApplication.MyNotesComponent.showTableData(tableData);
    },
  );
};

MainApplication.MyNotesComponent.showTableData = function (tableData) {
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
  $("#mynotes-page").removeClass("hidden");
  globalDefinitions.closeLoader();
};

MainApplication.MyNotesComponent.exportToExcel = function () {
  var excelName =
    configProperties.MTNNOTELIST.setting + $spcontext.stringnifyDate() + ".csv";
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

    excelData += dataString.toString() + "\n";
    excelData = "\uFEFF" + excelData;
  });

  MainApplication.MyNotesComponent.downloadData(excelName, excelData);
};

MainApplication.MyNotesComponent.downloadData = function (excelname, data) {
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

MainApplication.MyNotesComponent.validateCSVContent = function (data) {
  if (typeof data == "string") {
    //data = data.replace(/,/g, "~");
    data = data.replace(/\n/g, "");
    data = data.replace(/\r/g, "");
    data = data.replace(/\r\n/g, "");
    data = MainApplication.MyNotesComponent.encloseStringWithCommaCheck(data);
  }
  return data;
};

MainApplication.MyNotesComponent.encloseStringWithCommaCheck = function (value) {
  if (value.includes(",")) {
    return '"' + value + '"';
  }
  return value;
};

MainApplication.MyNotesComponent.updateDateConstraints = function () {
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

MainApplication.MyNotesComponent.populateMeetingTypeDropdown = function () {
  var meetingTypes = Object.values(MainApplication.meetingType || {})
    .flat()
    .map(function (item) {
        return item.Title;
    })
    .filter(Boolean);

  var divisions = MainApplication.newDivisions || [];

  var filterOptions = [...new Set([...divisions, ...meetingTypes])];

  $("#status-filter-type").html('<option value="">All</option>');

  filterOptions.forEach(function (item) {
      $("#status-filter-type").append(
          $("<option>", {
              value: item,
              text: item
          })
      );
  });
}