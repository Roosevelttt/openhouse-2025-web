function displayDrama(dataParticipant) {
  const customDatatable = document.getElementById("datatable");
  if (customDatatable) {
    customDatatable.innerHTML = "";
    const data = dataParticipant;
    const instance = new te.Datatable(
      customDatatable,
      {
        columns: [
          { label: "NRP", field: "nrp", sort: true },
          { label: "Name", field: "name", sort: true },
          { label: "File", field: "file", sort: true },
          { label: "Line ID", field: "line", sort: true },
          { label: "Phone", field: "phone", sort: true },
          { label: "Interview", field: "interview" },
          { label: "Status", field: "isAccepted" },
        ],
        rows: data.map((item) => {
          return {
            ...item,
            isAccepted:
              item.isAccepted == 1
                ? "Accepted"
                : item.isAccepted == 2
                  ? "Rejected"
                  : "Pending",
            interview:
              item.interview == 1
                ? "Waiting"
                : item.interview == 2
                  ? "Done"
                  : "Not Scheduled",
          };
        }),
      },
      { hover: true, stripped: true },
    );
    const advancedSearchInput = document.getElementById(
      "advanced-search-input",
    );

    const search = (value) => {
      let [phrase, columns] = value.split(" in:").map((str) => str.trim());

      if (columns) {
        columns = columns.split(",").map((str) => str.toLowerCase().trim());
      }

      instance.search(phrase, columns);
    };

    document
      .getElementById("advanced-search-button")
      .addEventListener("click", (e) => {
        search(advancedSearchInput.value);
      });

    advancedSearchInput.addEventListener("keydown", (e) => {
      search(e.target.value);
    });
  }
}

// displayDrama(JSON.parse(@json($dramaParticipant)));
