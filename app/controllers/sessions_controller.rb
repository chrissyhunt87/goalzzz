class SessionsController < ApplicationController

  def create
    @user = User.find_by(email: params[:email])
    if @user.authenticate(params[:password])
      session[:user_id] = params[:user_id]
      redirect_to user_path(@user)
    else
      render 'users#index'
    end
  end

  def destroy
    session.delete :user_id
    redirect_to users_path
  end

end
