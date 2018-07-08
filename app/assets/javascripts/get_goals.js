function getAllGoals() {
  $.ajax({
    method: 'GET',
    url: '/goals',
    contentType: 'application/json'
  }).done(function(response) {
    response.forEach(obj => {
      new Goal(obj.id, obj.description, obj.start_date, obj.end_date, obj.interval, obj.priority, obj.user_id)
    })
    loadAllGoals();
  })
}

function loadAllGoals() {
  let html = '<div class="col-12 main">'
  html += '<h1>All Goals</h1>'
  html += '<div class="row">'
  html += formatGoalsByPriority("high")
  html += formatGoalsByPriority("medium")
  html += formatGoalsByPriority("low")
  html += '</div></div>'
  $('div#content').append(html)
  setGoalsEventListeners();
}

function getGoal(goal) {
  console.log('load goal triggered, ID: ', goal.dataset.id);
}

function formatGoalsByPriority(priority) {
  let goalsHTML = '<div class="col-4">'
  goalsHTML += `<h4>${priority} PRIORITY</h4>`
  let priorityGoals = store.goals.filter(goal => {
    return goal.priority === priority
  })
  if (priorityGoals.length > 0) {
    priorityGoals.forEach(goal => {
      goalsHTML += `<a href="#" data-id="${goal.id}">${goal.description}</a><br />`
      goalsHTML += `<span class="end-date">${goal.interval.toUpperCase()}&nbsp;&middot;&nbsp;THROUGH ${goal.endDate}</span><br />`
    })
  } else {
    goalsHTML += '(None.)<br />'
  }
  return goalsHTML += '</div>'
}

function setGoalsEventListeners() {
  $('a').on('click', function(e) {
    e.preventDefault();
    getGoal(e.target);
  })
}

function clearContent() {
  $('div#content').text('')
}
