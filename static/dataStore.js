const DataStore = () => {
  tasks = [];
  sortedTasksByList = {};
  lists = [];
  sortedLists = {};

  set = (name, values) => {
    this[name] = values;
  };

  get = (listName, id) => {
    if (listName === "task") return tasks.find((task) => task.id === id);
    else if (listName === "list") return sortedLists[id];
  };

  getAll = (name) => {
    return this[name];
  };

  add = (listName, item) => {
    if (listName === "task") addTask(item);
    else if (listName === "list") addList(item);
  };

  addTask = (task) => {
    tasks.push(task);
    sortedTasksByList.nolist.push(task);
  };

  addList = (list) => {
    lists.push(list);
    sortedLists[list.id] = list;
  };

  update = (listName, updatedItem) => {
    if (listName === "task") updateTask(updatedItem);
    else if (listName === "list") updateList(updatedItem);
  };

  updateTask = (updatedTask) => {
    let oldTaskListId = "";
    const updatedListId = updatedTask.list_id || "nolist";

    const index = tasks.findIndex((task) => {
      if (task.id === updatedTask.id) {
        oldTaskListId = task.list_id || "nolist";
        return true;
      }
      return false;
    });
    tasks[index] = updatedTask;

    if (updatedListId !== oldTaskListId) {
      const oldSortedTasksByListIndex = sortedTasksByList[
        oldTaskListId
      ].findIndex((task) => task.id === updatedTask.id);
      sortedTasksByList[oldTaskListId].splice(oldSortedTasksByListIndex, 1);

      if (sortedTasksByList[updatedListId]) {
        sortedTasksByList[updatedListId].push(task);
      } else {
        sortedTasksByList[updatedListId] = [task];
      }
    } else {
      const inListIndex = sortedTasksByList[updatedListId].findIndex(
        (task) => task.id === updatedTask.id
      );
      sortedTasksByList[updatedListId][inListIndex] = updatedTask;
    }
  };

  updateList = (updatedList) => {
    lists = lists.map((list) => {
      if (list.id === updatedList.id) return updatedList;
      return list;
    });
    sortedLists[updatedList.id] = updatedList;
  };

  remove = (listName, id) => {
    if (listName === "task") removeTask(id);
    else if (listName === "list") removeList(id);
  };

  removeTask = (id) => {
    let listId = "";
    const index = tasks.findIndex((task) => {
      if (task.id === updatedTask.id) {
        listId = task.list_id || "nolist";
        return true;
      }
      return false;
    });
    tasks.splice(index, 1);

    const inListIndex = sortedTasksByList[listId].findIndex(
      (task) => task.id === id
    );
    sortedTasksByList[listId].splice(inListIndex, 1);
  };

  removeList = (id) => {
    delete sortedLists[id];
    lists = lists.filter((list) => list.id !== id);
  };

  return { set, get, getAll, add, update, remove };
};
