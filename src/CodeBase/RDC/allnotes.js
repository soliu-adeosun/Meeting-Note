loadAllNotesComponent = function () {
  if (MainApplication.cachedState.mode) {
    whenAllNotesDependeciesLoaded();
  } else {
    MainApplication.cachedState.pageStateCall = loadAllNotesComponent;
  }
};

var AppRequest;

MainApplication.AllNotesComponent.ApplicationDetails = function () {
  this.fullTableData = [];
  this.dataForExport = [];
};

function whenAllNotesDependeciesLoaded() {
  globalDefinitions.sortResponse && globalDefinitions.sortResponse();

  AppRequest = new MainApplication.AllNotesComponent.ApplicationDetails();

  speedctxRoot.DataForTable.tablecontentId = "speed-data-table";
  speedctxRoot.DataForTable.pagesize = 20;
  speedctxRoot.DataForTable.paginateSize = 5;
  speedctxRoot.DataForTable.modifyTR = false;
  speedctxRoot.DataForTable.context = speedctxRoot;
  speedctxRoot.DataForTable.paginationbId = "myrequestpagination";
  speedctxRoot.DataForTable.paginationuId = "toppagination";

  speedctxRoot.DataForTable.propertiesHandler = {
    ReferenceID: function (valueToEva) {
      var id = valueToEva.ReferenceID || "";

      return (
          '<a class="brown-anchor" title="View Meeting Note" href="#/viewnote?itemId=' +
          id +
          '">' +
          id +
          "</a>"
        );
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
        return (
          '<span class="vn-task-status is-completed">' +
          valueToEva.Status +
          "</span>"
        );
      }
      if (valueToEva.Status === "Draft") {
        return (
          '<span class="vn-task-status is-notstarted">' +
          valueToEva.Status +
          "</span>"
        );
      }
      return valueToEva.Status || "";
    },
  };

  $(document)
    .off("change.allNotesFilter", "#status-filter, #status-filter-type")
    .on("change.allNotesFilter", "#status-filter, #status-filter-type", function () {
      MainApplication.AllNotesComponent.applyClientFilters();
    });

  $(document)
    .off("keyup.allNotesSearch", "#searchInput")
    .on("keyup.allNotesSearch", "#searchInput", function () {
      MainApplication.AllNotesComponent.applyClientFilters();
    });

  MainApplication.AllNotesComponent.retrieveAllNotes();
}

MainApplication.AllNotesComponent.listColumns = function () {
  return {
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
      "NumberOfTaskItems",
      "Modified",
      "Status",
      "Reporter",
    ],
  };
};

MainApplication.AllNotesComponent.listName = function () {
  return (
    (configProperties.MTNNOTELIST && configProperties.MTNNOTELIST.setting) ||
    globalDefinitions.stageDefinitions.listname
  );
};

/** All notes — no reporter / attendee filter */
MainApplication.AllNotesComponent.retrieveAllNotes = function () {
  var listName = MainApplication.AllNotesComponent.listName();
  if (!listName) {
    setTimeout(MainApplication.AllNotesComponent.retrieveAllNotes, 400);
    return;
  }

  var query =
    '<View Scope="RecursiveAll"><Query>' +
    '<OrderBy><FieldRef Name="Modified" Ascending="FALSE"/></OrderBy>' +
    "</Query></View>";

  speedctxRoot.getListToItems(
    listName,
    query,
    MainApplication.AllNotesComponent.listColumns(),
    true,
    null,
    function (tableData) {
      AppRequest.fullTableData = tableData || [];
      MainApplication.AllNotesComponent.applyDataset(AppRequest.fullTableData);
    }
  );
};

MainApplication.AllNotesComponent.applyDataset = function (tableData) {
  AppRequest.fullTableData = tableData || [];

  var pendingItems = AppRequest.fullTableData.filter(function (item) {
    return item.Status === "Draft";
  });
  var completedItems = AppRequest.fullTableData.filter(function (item) {
    return item.Status === "Submitted";
  });

  $("#totalRequest").text(AppRequest.fullTableData.length);
  $("#pendingRequest").text(pendingItems.length);
  $("#completedRequest").text(completedItems.length);

  MainApplication.AllNotesComponent.populateMeetingTypeFilter(
    AppRequest.fullTableData
  );
  MainApplication.AllNotesComponent.showTableData(AppRequest.fullTableData);
};

MainApplication.AllNotesComponent.populateMeetingTypeFilter = function (data) {
  var types = [];
  (data || []).forEach(function (item) {
    if (item.MeetingType) types.push(item.MeetingType);
  });
  var unique = Array.from(new Set(types)).filter(Boolean).sort();

  var $sel = $("#status-filter-type");
  var current = $sel.val();
  $sel.html('<option value="">All</option>');
  unique.forEach(function (t) {
    $sel.append($("<option>", { value: t, text: t }));
  });
  if (current) $sel.val(current);
};

MainApplication.AllNotesComponent.applyClientFilters = function () {
  var data = AppRequest.fullTableData || [];
  var category = $("#status-filter").val();
  var meetingType = $("#status-filter-type").val();
  var searchQuery = ($("#searchInput").val() || "").trim();

  var filtered = data.filter(function (item) {
    if (category && item.MeetingCategory !== category) return false;
    if (meetingType && item.MeetingType !== meetingType) return false;
    return true;
  });

  if (searchQuery) {
    var q = searchQuery.toLowerCase();
    filtered = filtered.filter(function (item) {
      return (
        String(item.ReferenceID || "").toLowerCase().indexOf(q) > -1 ||
        String(item.MeetingType || "").toLowerCase().indexOf(q) > -1 ||
        String(item.Reporter || "").toLowerCase().indexOf(q) > -1 ||
        String(item.Title || "").toLowerCase().indexOf(q) > -1
      );
    });
  }

  MainApplication.AllNotesComponent.showTableData(filtered);
};

MainApplication.AllNotesComponent.showTableData = function (tableData) {
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
  $("#allnotes-page").removeClass("hidden");
  globalDefinitions.closeLoader && globalDefinitions.closeLoader();
};