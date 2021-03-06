class Goal < ApplicationRecord
  enum interval: [ :daily, :weekly, :monthly ]
  enum priority: [ :high, :medium, :low ]

  belongs_to :user
  has_many :results
  has_many :successes, -> { where(status: 'success') }, class_name: 'Result'
  has_many :failures, -> { where(status: 'failure') }, class_name: 'Result'
  has_many :reflections, through: :results

  validates :description, :start_date, :end_date, :interval, :user_id, presence: true


  # def self.total_average_success_rate
  #   success_rates = self.all.collect do |goal|
  #     goal.success_rate
  #   end
  #   success_rates.inject(:+) / success_rates.size
  # end

  def self.completed
    self.all.select { |g| g.end_date <= Date.today }
  end

  def result_by_date(date)
    if self.interval == "daily"
      self.results.find_by(date: date)
    elsif self.interval == "weekly"
      ### return first success, or first result for week of date
      date = date.to_date
      range = (date..date+6).to_a
      results = range.collect { |date| self.results.find_by(date: date) }
      results = results - [nil]
      first_success = results.find { |r| r.status == "success" }
      !!first_success ? first_success : results.first
    else
      ### return first success, or first result for month of date
      date = date.to_date
      range = (date..date.next_month-1).to_a
      results = range.collect { |date| self.results.find_by(date: date) }
      results = results - [nil]
      first_success = results.find { |r| r.status == "success" }
      !!first_success ? first_success : results.first
    end
  end

  def reflection_by_date(date)
    if self.result_by_date(date)
      self.results.find_by(date: date).reflection
    end
  end

  def percent_complete
    days_counted = (Date.today - self.start_date + 1).to_i
    total_days = (self.end_date - self.start_date + 1).to_i
    (days_counted.to_f/total_days.to_f)*100
  end

  def success_rate
    days_counted = (Date.today - self.start_date + 1).to_i
    successful_days = self.successes.count
    (successful_days.to_f/days_counted.to_f)*100
  end

  def current_success_streak
    all_successes = self.successes.sort_by {|result| result.date }.reverse
    current_streak = 0

    all_successes.each_with_index do | result, index |

      # Monthly goals
      if self.interval == "monthly"
        last_month = all_successes.first.date.month
        date_marker = self.start_date.day

        if result == all_successes.first
          current_streak = 1
        elsif result.date.month == last_month-1 && result.date.day >= date_marker
          current_streak += 1
          last_month = result.date.month
        elsif result.date.month == last_month
          next
        else
          break
        end

      # Weekly goals
      elsif self.interval == "weekly"
        if result == all_successes.first
          current_streak = 1
        elsif result.date >= all_successes[index-1].date-13 && result.date.cweek == all_successes[index-1].date.cweek-1
          current_streak += 1
        else
          break
        end

      # Daily goals
      else
        if result == all_successes.first
          current_streak = 1
        elsif result.date == all_successes[index-1].date-1
          current_streak += 1
        else
          break
        end
      end
    end

    current_streak
  end

  def longest_streak
    all_successes = self.successes.sort_by { |result| result.date }
    current_longest_streak = 0
    current_streak = 0

    all_successes.each_with_index do |result, index|

      ### Monthly goals
      if self.interval == "monthly"
        last_month = all_successes.first.date.month
        date_marker = self.start_date.day

        if result == all_successes.first
          current_streak = 1
        elsif result.date.month == last_month+1 && result.date.day >= date_marker
          current_streak += 1
          if current_streak > current_longest_streak
            current_longest_streak = current_streak
          end
        elsif result.date.month == last_month
          next
        else
          current_streak = 0
        end

      ### Weekly goals
      elsif self.interval == "weekly"
        if current_streak == 0
          current_streak += 1
        elsif result.date <= all_successes[index-1].date+13 && result.date.cweek == all_successes[index-1].date.cweek+1
          current_streak += 1
          if current_streak > current_longest_streak
            current_longest_streak = current_streak
          end
        else
          current_streak = 0
        end

      ### Daily goals
      else
        # first result in all_successes
        if current_streak == 0
          current_streak += 1

        # current date is one day after previous result's date => streak!
        elsif result.date == all_successes[index-1].date+1
          current_streak += 1
          if current_streak > current_longest_streak
            current_longest_streak = current_streak
          end

        # current date breaks the streak => reset to continue
        else
          current_streak = 0
        end
      end
    end
    current_longest_streak
  end

end
