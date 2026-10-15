loadAllTasksComponent = function () {
  if (MainApplication.cachedState.mode) {
    whenAllTasksDependeciesLoaded();
  } else {
    MainApplication.cachedState.pageStateCall = loadAllTasksComponent;
  }
};

var AppRequest;

MainApplication.AllTasksComponent.ApplicationDetails = function () {
  this.fullTableData = [];
  this.dataForExport = [];
};

function whenAllTasksDependeciesLoaded() {
  globalDefinitions.sortResponse && globalDefinitions.sortResponse();

  AppRequest = new MainApplication.AllTasksComponent.ApplicationDetails();

  speedctxRoot.DataForTable.tablecontentId = "speed-data-table";
  speedctxRoot.DataForTable.pagesize = 20;
  speedctxRoot.DataForTable.paginateSize = 5;
  speedctxRoot.DataForTable.modifyTR = false;
  speedctxRoot.DataForTable.context = speedctxRoot;
  speedctxRoot.DataForTable.paginationbId = "myrequestpagination";
  speedctxRoot.DataForTable.paginationuId = "toppagination";

  speedctxRoot.DataForTable.propertiesHandler = {
    DueDate: function (valueToEva) {
      return $spcontext.stringnifyDate({
        value: valueToEva.DueDate,
        includeTime: false,
        format: "dd/mm/yy",
      });
    },
    Status: function (valueToEva) {
      if (valueToEva.Status === "Completed") {
        return (
          '<span class="vn-task-status is-completed">' +
          valueToEva.Status +
          "</span>"
        );
      }
      if (valueToEva.Status === "In Progress") {
        return (
          '<span class="vn-task-status is-progress">' +
          valueToEva.Status +
          "</span>"
        );
      }
      if (valueToEva.Status === "Not Started") {
        return (
          '<span class="vn-task-status is-notstarted">' +
          valueToEva.Status +
          "</span>"
        );
      }
      return valueToEva.Status || "";
    },

    Modified: function (valueToEva) {
      var id = valueToEva.ID || "";
      var viewicon = '<i class="fa fa-eye" aria-hidden="true"></i>';
      if (!id) return "";
      return (
        '<a title="View Task" class="brown-anchor" href="#/viewtask?itemId=' +
        id +
        '">' +
        viewicon +
        "</a>"
      );
    }
  };

  $(document)
    .off("change.allTasksFilter", "#status-filter")
    .on("change.allTasksFilter", "#status-filter", function () {
      MainApplication.AllTasksComponent.applyClientFilters();
    });

  $(document)
    .off("keyup.allTasksSearch", "#searchInput")
    .on("keyup.allTasksSearch", "#searchInput", function () {
      MainApplication.AllTasksComponent.applyClientFilters();
    });

  MainApplication.AllTasksComponent.retrieveAllTasks();
}

/** All tasks — no Name / Department filter */
MainApplication.AllTasksComponent.retrieveAllTasks = function () {
  var listName =
    (configProperties.TASKLIST && configProperties.TASKLIST.setting) ||
    "MeetingNoteTasks";

  var query =
    '<View Scope="RecursiveAll"><Query>' +
    '<OrderBy><FieldRef Name="Modified" Ascending="FALSE"/></OrderBy>' +
    "</Query></View>";

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
        "MeetingType",
        "MeetingCategory",
    ],
  };

  speedctxRoot.getListToItems(
    listName,
    query,
    extraProperties,
    true,
    null,
    function (tableData) {
      AppRequest.fullTableData = tableData || [];

      var completedItems = AppRequest.fullTableData.filter(function (item) {
        return item.Status === "Completed";
      });
      var pendingItems = AppRequest.fullTableData.filter(function (item) {
        return (
          item.Status === "In Progress" || item.Status === "Not Started"
        );
      });

      $("#totalRequest").text(AppRequest.fullTableData.length);
      $("#pendingRequest").text(pendingItems.length);
      $("#completedRequest").text(completedItems.length);

      MainApplication.AllTasksComponent.showTableData(AppRequest.fullTableData);
    }
  );
};

MainApplication.AllTasksComponent.applyClientFilters = function () {
  var data = AppRequest.fullTableData || [];
  var status = $("#status-filter").val();
  var searchQuery = ($("#searchInput").val() || "").trim();

  var filtered = data.filter(function (item) {
    if (status && item.Status !== status) return false;
    return true;
  });

  if (searchQuery) {
    var q = searchQuery.toLowerCase();
    filtered = filtered.filter(function (item) {
      return (
        String(item.Task || "").toLowerCase().indexOf(q) > -1 ||
        String(item.Name || "").toLowerCase().indexOf(q) > -1 ||
        String(item.ReferenceID || "").toLowerCase().indexOf(q) > -1 ||
        String(item.Title || "").toLowerCase().indexOf(q) > -1
      );
    });
  }

  MainApplication.AllTasksComponent.showTableData(filtered);
};

MainApplication.AllTasksComponent.showTableData = function (tableData) {
  AppRequest.dataForExport = tableData;
  if (!tableData || tableData.length === 0) {
    $("#tasktable").hide();
    $("#speed-data-table").empty();
    $(".norequest").show();
  } else {
    $("#tasktable").show();
    $(".norequest").hide();
    speedctxRoot.manualTable(tableData);
  }
  $("#newLoader").hide();
  $("#alltasks-page").removeClass("hidden");
  globalDefinitions.closeLoader && globalDefinitions.closeLoader();
};