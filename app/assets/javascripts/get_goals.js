// GOAL INDEX DISPLAY FUNCTIONS

function getAllGoals() {
  $.ajax({
    method: 'GET',
    url: '/goals',
    contentType: 'application/json'
  }).done(function(response) {
    response.forEach(obj => {
      new Goal(obj.id, obj.description, obj.start_date, obj.end_date, obj.interval, obj.priority, obj.user_id);
    })
    loadAllGoals();
  })
}

function loadAllGoals() {
  let html = '<div class="row"><div class="col-12 main">'
  html += '<h1>All Goals</h1>'
  html += '<div class="row">'
  html += formatGoalsByPriority("high")
  html += formatGoalsByPriority("medium")
  html += formatGoalsByPriority("low")
  html += '</div></div></div>'
  html += generateNewGoalForm();
  $('div#content').append(html)
  setGoalsEventListeners();
  setNewGoalEventListeners();
}

function generateNewGoalForm() {
  let html = '<div class="row"><div class="col-12 secondary">'
  html += '<h3>Set a New Goal</h3>'
  html += '<form class="new_goal" id="new_goal" action="/goals" accept-charset="UTF-8" method="post">'
  html += `<input type="hidden" name="authenticity_token" value="${getAuthenticityToken()}">`
  html += '<input type="hidden" name="goal[user_id]" id="goal_user_id">'
  html += 'Describe your goal: <input type="text" name="goal[description]" id="goal_description"><br>'
  html += 'Start Date: <input type="date" name="goal[start_date]" id="goal_start_date"><br>'
  html += 'End Date: <input type="date" name="goal[end_date]" id="goal_end_date"><br>'
  html += 'Interval: <select name="goal[interval]" id="goal_interval"><br>'
  html += '<option value="daily">daily</option>'
  html += '<option value="weekly">weekly</option>'
  html += '<option value="monthly">monthly</option>'
  html += '</select><br>'
  html += 'Priority: <select name="goal[priority]" id="goal_priority"><br>'
  html += '<option value="high">high</option>'
  html += '<option value="medium">medium</option>'
  html += '<option value="low">low</option>'
  html += '</select><br>'
  html += '<input type="submit" name="commit" value="Create Goal">'
  html += '</form></div></div></div>'
  return html;
}

function formatGoalsByPriority(priority) {
  let goalsHTML = `<div class="col-4 ${priority}-priority">`
  goalsHTML += `<h4>${priority} PRIORITY</h4>`
  let priorityGoals = store.goals.filter(goal => {
    return goal.priority === priority
  })
  if (priorityGoals.length > 0) {
    priorityGoals.forEach(goal => {
      goalsHTML += `<a href="#" data-id="${goal.id}">${goal.description}</a><br />`
      goalsHTML += `<span class="end-date">${goal.interval.toUpperCase()}&nbsp;&middot;&nbsp;THROUGH ${moment(goal.endDate).format('M/D/YYYY').toUpperCase()}</span><br />`
    })
  } else {
    goalsHTML += '(None.)<br />'
  }
  return goalsHTML += '</div>'
}

// GOAL SHOW DISPLAY FUNCTIONS

function getGoalResults(goal) {
  console.log('load goal triggered, ID: ', goal.dataset.id);
  $.ajax({
    method: 'GET',
    url: `/goals/${goal.dataset.id}.json`,
    contentType: 'application/json'
  }).done(response => {
    clearResults();
    clearReflections();
    response.results.forEach(obj => {
      new Result(obj.id, obj.goal_id, obj.status, obj.date);
      obj.reflections.forEach(refl => {
        new Reflection(refl.id, refl.content, refl.result_id);
      })
    })
    loadGoalResults(goal.dataset.id);
  })
}

function loadGoalResults(goalId) {
  let goal = store.goals.filter(goal => goal.id == goalId)[0];
  clearContent();
  let html = '<div class="row"><div class="col-12 main">'
  html += `<h1>${goal.description}</h1>`
  html += `<p><a href="#" data-goal-id="${goalId}" id="delete">Delete this goal</a></p>`
  html += `<p>(Stats will go here.)</p>`
  html += '<div class="row">'
  html += generateResultsDisplay(goal);
  html += '</div></div></div>'
  html += '<div class="row"><div class="col-12 secondary">'
  html += generateReflectionsDisplay(goal);
  $('div#content').append(html);
  setGoalNavLinkEventListeners();
  setResultBoxEventListeners();
  setGoalDeleteEventListeners();
  setReloadGoalsEventListeners();
}

function addNewGoalToList(goal) {
  let priority = goal.priority;
  let goalHTML = `<a href="#" data-id="${goal.id}">${goal.description}</a><br />`
  goalHTML += `<span class="end-date">${goal.interval.toUpperCase()}&nbsp;&middot;&nbsp;THROUGH ${moment(goal.endDate).format('M/D/YYYY').toUpperCase()}</span><br />`
  $(`div.${priority}-priority`).append(goalHTML);
  $('a').off();
  setGoalsEventListeners();
}

function generateReflectionsDisplay(goal) {
  console.log('generateReflectionsDisplay triggered');
  let reflections = store.reflections.map(refl => {
    let result = store.results.filter(result => result.id === refl.resultId)[0]
    refl.date = result.date;
    refl.status = result.status;
    return refl;
  }).sort((a, b) => {
    return a.date - b.date;
  })

  let html = '<h3>Your Thoughts So Far</h3>'
  reflections.forEach(refl => {
    let success = '';
    if (refl.status === 'success') {
      success = '-success'
    }
    html += '<div class="row"><div class="col-2">'
    html += `${moment(refl.date).format('M/D/YYYY')}`
    html += `</div><div class="col-10 notes-col${success}">`
    html += `${refl.content}`
    html += '</div></div>'
  })
  // html += generateNewReflectionForm(goal);
  html += `<p class="menu"><a href="#" id="prevgoal" data-id="${findPreviousGoal(goal)}"><< PREV</a> &nbsp;&middot;&nbsp; <a href="#" id="nextgoal" data-id="${findNextGoalId(goal)}">NEXT >></a></p>`
  return html;
}

function findNextGoalId(goal) {
  let storeGoalId = store.goals.indexOf(goal)
  if (store.goals[storeGoalId+1]) {
    return store.goals[storeGoalId+1].id;
  } else {
    return goal.id;
  }
}

function findPreviousGoal(goal) {
  let storeGoalId = store.goals.indexOf(goal)
  if (store.goals[storeGoalId-1]) {
    return store.goals[storeGoalId-1].id;
  } else {
    return goal.id;
  }
}

function generateResultsDisplay(goal) {
  if (goal.interval == "daily") {
    return generateDailyResultsDisplay(goal);
  } else if (goal.interval == "weekly") {
    return generateWeeklyResultsDisplay(goal);
  } else {
    return generateMonthlyResultsDisplay(goal);
  }
}

function generateDailyResultsDisplay(goal) {
  let goalDatesArray = goal.generateDateRange();
  let html = '';
  // Using generated array of dates (needed to build display) to check for matching results
  goalDatesArray.forEach(date => {
    let result = store.results.filter(result => result.date === date.format('YYYY-MM-DD'))[0]
    let resultClass;
    let dataProperty = `data-goal-id="${goal.id}" data-full-date="${date.format('YYYY-MM-DD')}"`;
    if (result) {
      dataProperty += ` data-id="${result.id}" data-status="${result.status}"`
      if (result.status == "success") {
        resultClass="green"
      } else {
        resultClass="red"
      }
    } else {
      resultClass = "blank"
    }
    html += `<div class="col-1 ${resultClass}-result box" ${dataProperty}>`
    html += `${date.format('M/D')}`
    html += '</div>'
  })
  return html;
}

function generateWeeklyResultsDisplay(goal) {
  let goalDatesArray = goal.generateDateRange();
  let html = '';
  goalDatesArray.forEach(date => {
    let currentDate = date.format('YYYY-MM-DD');
    let endOfWeek = date.clone().add(6, 'days').format('YYYY-MM-DD');
    let resultsInWeek = store.results.filter(result => moment(result.date).isBetween(currentDate, endOfWeek, null, '[]'));
    let successesInWeek = resultsInWeek.filter(result => result['status'] == "success");
    let resultClass = "blank";
    let dataProperty = `data-goal-id="${goal.id}" data-full-date="${currentDate}"`;

    // select for (1) first success, OR (2) first overall result
    if (successesInWeek.length > 0) {
      dataProperty += ` data-id="${successesInWeek[0]['id']}" data-status="success"`
      resultClass = "green";
      //eventually add link val -> first success in here?
    } else if (resultsInWeek.length > 0) {
      dataProperty += ` data-id="${resultsInWeek[0]['id']}" data-status="failure"`
      resultClass = "red";
      //eventually add link val -> first result in here?
    };
    html += `<div class="col-1 ${resultClass}-result box" ${dataProperty}>`;
    html += `${date.format('M/D')}`;
    html += '</div>';
  });
  return html;
}

function generateMonthlyResultsDisplay(goal) {
  let goalDatesArray = goal.generateDateRange();
  let html = '';
  // Using generated array of dates (needed to build display) to check for matching results
  goalDatesArray.forEach(date => {
    let resultsInMonth = store.results.filter(result => moment(result.date).format('MM') === date.format('MM'));
    let successesInMonth = resultsInMonth.filter(result => result['status'] == "success");
    let resultClass = "blank";
    let dataProperty = `data-goal-id="${goal.id}" data-full-date="${date.format('YYYY-MM-DD')}"`;
    // select for (1) first success, OR (2) first overall result
    if (successesInMonth.length > 0) {
      dataProperty += ` data-id="${successesInMonth[0]['id']}" data-status="success"`
      resultClass = "green";
      //eventually add link val -> first success in here?
    } else if (resultsInMonth.length > 0) {
      dataProperty += ` data-id="${resultsInMonth[0]['id']}" data-status="failure"`
      resultClass = "red";
      //eventually add link val -> first result in here?
    };
    html += `<div class="col-1 ${resultClass}-result box" ${dataProperty}>`;
    html += `${date.format('MMM')}`;
    html += '</div>';
  })
  return html;
}

// DELETE GOALS

function deleteGoal(goalId) {
  let authToken = getAuthenticityToken();
  console.log('deleteGoal triggered: ', goalId)
  $.ajax({
    method: 'DELETE',
    url: `/goals/${goalId}`,
    data: JSON.stringify({token: authToken}),
    contentType: 'application/json',
    processData: false,
    dataType: 'json',
    success: reloadGoalsAfterDelete(goalId)
  })
}

function reloadGoalsAfterDelete(goalId) {
  clearContent();
  let updatedStoreGoals = store.goals.filter(goal => goal.id != goalId)
  store.goals = updatedStoreGoals;
  loadAllGoals();
}

// CREATE AND UPDATE RESULTS

function updateResult(target) {
  console.log('call updateResult on: ', target)
  let currentStatus = target.dataset.status;
  let updatedStatus;
  if (currentStatus === "success") {
    updatedStatus = "failure";
  } else {
    updatedStatus = "success";
  }
  let updateData = {
    'status': `${updatedStatus}`
  }
  console.log(updateData);
  console.log('path: ', `/goals/${target.dataset.goalId}/results/${target.dataset.id}`)
  $.ajax({
    method: 'PATCH',
    url: `/goals/${target.dataset.goalId}/results/${target.dataset.id}`,
    data: JSON.stringify(updateData),
    contentType: 'application/json',
    processData: false,
    dataType: 'json'
  }).done(() => {
    let storeResult = store.results.filter(result => result.id == target.dataset.id)[0]
    storeResult.status = updatedStatus;

    let newClass;
    let oldClass;
    if (updatedStatus === "success") {
      newClass = "green-result";
      oldClass = "red-result";
    } else {
      newClass = "red-result";
      oldClass = "green-result"
    }

    console.log(storeResult.status);
    $(`div[data-id="${target.dataset.id}"]`).addClass(newClass).removeClass(oldClass);
    $(`div[data-id="${target.dataset.id}"]`).attr('data-status', updatedStatus);
  })
}

function createResult(target) {
  console.log('call createResult on: ', target)
  let goalId = target.dataset.goalId;
  let date = target.dataset.fullDate;
  let createData = {
    'goal_id': goalId,
    'date': date,
    'status': 'success'
  }
  $.ajax({
    method: 'POST',
    url: `/goals/${goalId}/results`,
    data: JSON.stringify(createData),
    contentType: 'application/json',
    processData: false,
    dataType: 'json'
  }).done(response => {
    let result = new Result(response.id, response.goal_id, response.status, response.date)
    $(`div[data-full-date="${date}"]`).addClass("green-result").removeClass("blank-result");
    $(`div[data-full-date="${date}"]`).attr('data-status', 'success');
    $(`div[data-full-date="${date}"]`).attr('data-id', `${result.id}`);
  })
}

// GENERAL UTILITY

function clearContent() {
  $('div#content').text('')
}

function clearResults() {
  store.results = [];
}

function clearReflections() {
  store.reflections = [];
}

function getAuthenticityToken() {
  return $('meta[name="csrf-token"]').attr('content')
}

function reloadGoals() {
  clearContent();
  loadAllGoals();
}
