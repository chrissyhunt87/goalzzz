# Specifications for the Rails with jQuery Assessment

Specs:
- [x] Use jQuery for implementing new requirements -> Yes, used for /goals resources
- [x] Include a show resource rendered using jQuery and an Active Model Serialization JSON backend. -> Yes, see goals#show
- [x] Include an index resource rendered using jQuery and an Active Model Serialization JSON backend. -> Yes, see goals#index
- [x] Include at least one has_many relationship in information rendered via JSON and appended to the DOM. -> Yes, a goal has_many results
- [x] Use your Rails API and a form to create a resource and render the response without a page refresh. -> Yes, new_goal form on goal index renders new goal without refresh
- [x] Translate JSON responses into js model objects. -> Yes, new Goals, Results, Reflections are rendered as js model objects and pushed to store
- [x] At least one of the js model objects must have at least one method added by your code to the prototype. -> Yes, Goal model object can render a valid date range (see assets/javascripts/goal.js)

Confirm
- [x] You have a large number of small Git commits
- [x] Your commit messages are meaningful
- [x] You made the changes in a commit that relate to the commit message
- [x] You don't include changes in a commit that aren't related to the commit message
