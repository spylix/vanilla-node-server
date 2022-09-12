const dataStore = DataStore();

const renderListOptions = (selectedListId) => {
  let listsHtml = "";

  listsHtml += `<option value="">No list</option>`;
  dataStore.getAll("lists").forEach((list) => {
    listsHtml += `
      <option 
        value="${list.id}" 
        ${selectedListId === list.id ? "selected" : ""}>
          ${list.name}
      </option>`;
  });

  return listsHtml;
};

const renderTaskElement = ({ id, ...task }) => `
  <form 
    id="task-${id}-wrapper" 
    class="task-wrapper" 
    method="post" 
    onsubmit="toggleEditTask(event, ${id}, ${task.list_id})">
      <input
        type="checkbox"
        id="task-${id}"
        ${task.checked ? "checked" : ""}
        onchange="handleToggleTask(event, ${id})">
      </input>
      <label
        id="task-${id}-name"
        for="task-${id}"
        class="task-name">
          ${task.name}
      </label>
      <input type="submit" value="Edit" id="submit-task-${id}" />
  </form>`;

const renderTaskListElement = ({ id, ...list }, sortedTasks) => {
  const taskListElement = document.createElement("div");
  taskListElement.className = "list";
  taskListElement.id = id;
  taskListElement.innerHTML += `
    <form
      id="list-form-${id}"
      class="list-form"
      method="post" 
      onsubmit="toggleEditList(event, ${id})">
        <h1>
          <div id="list-${id}-name" class="list-name">
            ${list.name}
          </div>
        </h1>
        <input type="submit" value="Edit" id="submit-list-${id}" />
    </form>`;
  sortedTasks[id]?.forEach(
    (task) => (taskListElement.innerHTML += renderTaskElement(task))
  );
  return taskListElement;
};

const sortTasks = (tasks) => {
  let sortedTasksByList = { nolist: [] };
  tasks.forEach((task) => {
    const listId = task.list_id || "nolist";
    if (sortedTasksByList[listId]) {
      sortedTasksByList[listId].push(task);
    } else {
      sortedTasksByList[listId] = [task];
    }
  });
  dataStore.set("tasks", tasks);
  dataStore.set("sortedTasksByList", sortedTasksByList);
  return { tasks, sortedTasksByList };
};

const sortLists = (lists) => {
  const sortedLists = {};
  lists.forEach((list) => {
    sortedLists[list.id] = list;
  });
  dataStore.set("lists", lists);
  dataStore.set("sortedLists", sortedLists);
  return { lists, sortedLists };
};

const loadTable = async (endpoint, sortFunc) => {
  try {
    const res = await fetch(endpoint, { method: "GET" });
    await checkStatus(res);
    const data = await res.json();
    return sortFunc(data);
  } catch (err) {
    renderError(err, true);
  }
};

const renderData = async () => {
  const { sortedTasksByList } = await loadTable("/task", sortTasks);
  const { lists, sortedLists } = await loadTable("/list", sortLists);

  const listsElement = document.getElementById("task-list");
  listsElement.innerHTML = "";

  const noListElement = document.createElement("div");
  noListElement.class = "list";
  noListElement.id = "no-list";
  noListElement.innerHTML += `<h1>Tasks</h1>`;
  sortedTasksByList.nolist.forEach(
    (task) => (noListElement.innerHTML += renderTaskElement(task))
  );
  listsElement.appendChild(noListElement);

  Object.entries(sortedLists).map(([listId, list]) => {
    if (listId === "nolist") return;
    listsElement.appendChild(renderTaskListElement(list, sortedTasksByList));
  });
};

const checkStatus = async (res) => {
  if (res.status >= 400 && res.status < 600) {
    const data = await res.json();
    throw data.error;
  }
};

const createItem = async (e, itemName, renderNewItem) => {
  e.preventDefault();
  try {
    const input = document.getElementById(itemName);
    const res = await fetch(`/${itemName}`, {
      method: "POST",
      body: JSON.stringify({ name: input.value }),
    });
    await checkStatus(res);
    const newItem = await res.json();
    dataStore.add(itemName, newItem);
    input.value = "";
    renderNewItem(newItem);
    clearError();
  } catch (err) {
    renderError(err);
  }
};

const createTask = (e) => {
  const renderNewTask = (newTask) => {
    const taskListElement = document.getElementById("no-list");
    taskListElement.innerHTML += renderTaskElement(newTask);
  };
  createItem(e, "task", renderNewTask);
};

const createList = (e) => {
  const renderNewList = (newList) => {
    const listsElement = document.getElementById("task-list");
    listsElement.appendChild(renderTaskListElement(newList, {}));
  };
  createItem(e, "list", renderNewList);
};

const updateItem = async (e, itemName, data, onAfterUpdate) => {
  e.preventDefault();
  try {
    const res = await fetch(`/${itemName}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
    await checkStatus(res);
    const updatedItem = await res.json();
    dataStore.update(itemName, updatedItem);
    if (onAfterUpdate) onAfterUpdate(updatedItem);
    clearError();
  } catch (err) {
    renderError(err);
  }
};

const handleToggleTask = (e, id) => {
  const updatedTask = {
    ...dataStore.get("task", id),
    checked: e.target.checked,
  };
  updateItem(e, "task", updatedTask);
};

const changeTaskList = (e, id) => {
  const updatedTask = {
    ...dataStore.get("task", id),
    list_id: +e.target.value || "",
  };
  const onAfterUpdate = (updatedTask) => {
    document.getElementById(`task-${id}-wrapper`).remove();
    const listElement = document.getElementById(
      updatedTask.list_id || "no-list"
    );
    listElement.innerHTML += renderTaskElement(updatedTask);
  };
  updateItem(e, "task", updatedTask, onAfterUpdate);
};

const deleteItem = async (itemName, id, onAfterDelete) => {
  try {
    const res = await fetch(`/${itemName}`, {
      method: "DELETE",
      body: JSON.stringify({ id }),
    });
    await checkStatus(res);
    dataStore.remove(itemName, id);
    if (onAfterDelete) onAfterDelete();
    clearError();
  } catch (err) {
    renderError(err);
  }
};

const deleteTask = async (id) => {
  const onAfterDelete = () => {
    document.getElementById(`task-${id}-wrapper`).remove();
  };
  deleteItem("task", id, onAfterDelete);
};

const deleteList = async (id) => {
  const onAfterDelete = () => {
    document.getElementById(id).remove();
  };
  deleteItem("list", id, onAfterDelete);
};

const enableEditTask = (e, id, nameElement) => {
  const taskElement = document.getElementById(`task-${id}-wrapper`);
  const newNameElement = document.createElement("input");
  const task = dataStore.get("task", id);
  newNameElement.id = `task-${id}-name`;
  newNameElement.setAttribute("class", nameElement.getAttribute("class"));
  newNameElement.setAttribute("value", nameElement.innerHTML.trim());
  nameElement.parentNode.replaceChild(newNameElement, nameElement);
  document.getElementById(`submit-task-${id}`).setAttribute("value", "Save");
  document.getElementById(`submit-task-${id}`).insertAdjacentHTML(
    "afterend",
    `<select
      id="task-${id}-select"
      onchange="changeTaskList(event, ${id})">
        ${renderListOptions(task.list_id)}
    </select>
    <button
      type="button"
      id="task-${id}-delete-button"
      onclick="deleteTask(${id})">
        Delete
    </button>`
  );
};

const saveEditedTask = async (e, id, nameElement) => {
  const updatedTask = {
    ...dataStore.get("task", id),
    name: nameElement.value,
  };
  const onAfterUpdate = () => {
    const newNameElement = document.createElement("label");
    newNameElement.id = `task-${id}-name`;
    newNameElement.setAttribute("class", nameElement.getAttribute("class"));
    newNameElement.setAttribute("for", `task-${id}`);
    newNameElement.innerHTML = nameElement.value;
    nameElement.parentNode.replaceChild(newNameElement, nameElement);
    document.getElementById(`submit-task-${id}`).setAttribute("value", "Edit");
    document.getElementById(`task-${id}-delete-button`).remove();
    document.getElementById(`task-${id}-select`).remove();
  };
  updateItem(e, "task", updatedTask, onAfterUpdate);
};

const toggleEditTask = (e, id, list_id) => {
  e.preventDefault();
  const nameElement = document.getElementById(`task-${id}-name`);
  if (!document.getElementById(`task-${id}-delete-button`)) {
    enableEditTask(e, id, nameElement);
  } else {
    saveEditedTask(e, id, nameElement);
  }
};

const enableEditList = (e, id, nameElement) => {
  const newNameElement = document.createElement("input");
  newNameElement.id = `list-${id}-name`;
  newNameElement.setAttribute("class", nameElement.getAttribute("class"));
  newNameElement.setAttribute("value", nameElement.innerHTML.trim());
  nameElement.parentNode.replaceChild(newNameElement, nameElement);
  document.getElementById(`submit-list-${id}`).setAttribute("value", "Save");
  document.getElementById(`submit-list-${id}`).insertAdjacentHTML(
    "afterend",
    `<button
      type="button"
      id="list-${id}-delete-button"
      onclick="deleteList(${id})">
        Delete
    </button>`
  );
};

const saveEditedList = async (e, id, nameElement) => {
  const updatedList = { id, name: nameElement.value };
  const onAfterUpdate = () => {
    const newNameElement = document.createElement("div");
    newNameElement.id = `list-${id}-name`;
    newNameElement.setAttribute("class", nameElement.getAttribute("class"));
    newNameElement.innerHTML = nameElement.value;
    nameElement.parentNode.replaceChild(newNameElement, nameElement);
    document.getElementById(`submit-list-${id}`).setAttribute("value", "Edit");
    document.getElementById(`list-${id}-delete-button`).remove();
  };
  updateItem(e, "list", updatedList, onAfterUpdate);
};

const toggleEditList = (e, id) => {
  e.preventDefault();
  const nameElement = document.getElementById(`list-${id}-name`);
  if (!document.getElementById(`list-${id}-delete-button`)) {
    enableEditList(e, id, nameElement);
  } else {
    saveEditedList(e, id, nameElement);
  }
};

const prepareError = (error) => {
  if (typeof error === "string") {
    return error;
  } else if (error) {
    const errors = error.map(
      (err) => `${err.schema.description} ${err.message}`
    );
    return errors.join(", ");
  }
};

const renderError = (error, skipRenderError) => {
  document.getElementById("error-message").innerHTML = prepareError(error);
};

const clearError = () => {
  document.getElementById("error-message").innerHTML = "";
};

renderData();
