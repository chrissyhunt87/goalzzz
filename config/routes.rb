Rails.application.routes.draw do
  resources :users
  resources :goals
  resources :reflections
  resources :results
  resources :sessions, only: [:create, :destroy]

  root 'users#index'
  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html
end
