from nada_dsl import *

def total(xs: list[SecretInteger]) -> SecretInteger:
    sum = Integer(0)
    for x in xs:
        sum += x
    return sum

def nada_main():
    # Create the parties for the participants
    participants = [Party("participant" + str(p)) for p in range(10)]
    official = Party(name="official")
    
    # Gather the inputs (yearly salary from each participant)
    yearly_salaries = [
        SecretInteger(
            Input(
                name="yearly_salary" + str(p),
                party=Party("participant" + str(p))
            )
        )
        for p in range(10)
    ]
    
    # Gather the input for meeting duration (in half-hour increments)
    meeting_duration_half_hours = SecretInteger(Input(name="meeting_duration", party=official))
    
    # Convert yearly salaries to hourly rates and calculate total salary
    hours_per_year = Integer(2080)  # Assuming 40 hours/week and 52 weeks/year
    hourly_rates = [salary / hours_per_year for salary in yearly_salaries]
    total_hourly_rate = total(hourly_rates)
    
    # Calculate total cost
    total_cost = total_hourly_rate * meeting_duration_half_hours * Integer(30)  # 30 minutes per half-hour
    
    return [Output(total_cost, "total_cost", official)]

