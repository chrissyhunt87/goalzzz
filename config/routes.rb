Rails.application.routes.draw do
  # get '/goals/completed' => 'goals#completed'
  get '/auth/facebook/callback' => 'sessions#create'
  resources :users
  resources :goals do
    get 'completed', on: :collection
    resources :results, only: [:new, :create, :show, :edit, :update, :destroy]
  end
  resources :sessions, only: [:create, :destroy]

  root 'users#index'
  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html
end
