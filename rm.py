import sys

def operate_on_list(operation, arg2, arg3=None):
    if operation == 'write':
        # Write operation
        arg3 = f'cache_{arg3}'  # Add "cache_" to the start of the filename for writing
        with open(arg3, 'w') as file:
            file.write('|||'.join(arg2))  # Use a unique separator
    elif operation == 'read':
        # Read operation
        arg2 = f'cache_{arg2}'  # Add "cache_" to the start of the filename for reading
        try:
            with open(arg2, 'r') as file:
                list_data = file.read()
                if list_data.strip() == '':
                    return []  # Return an empty list if the file is empty
                my_list = list_data.split('|||')  # Split by the unique separator
                return my_list
        except FileNotFoundError:
            return []  # Return an empty list if the file is not found
    else:
        print('Invalid operation type. Please use "read" or "write."')
        return []


def delete_flight_plan(file_path, callsign):
    with open(file_path, 'r', encoding='utf-8', newline='\n') as file:
        content = file.read()
    cache = operate_on_list("read", file_path)
    cache.append(content)
    if len(cache) > 20:
      cache.pop(0)
    
    operate_on_list("write", cache, file_path)

    if callsign in content:
        lines = content.split('\n')
        for i, line in enumerate(lines):
            if callsign in line:
                callsign_pos = i - 1
                
        while callsign_pos < len(lines) and lines[callsign_pos] != "":
            lines.pop(callsign_pos)
            
        lines.pop(callsign_pos)

        with open(file_path, 'w', encoding='utf-8', newline='\n') as file:
            file.write('\n'.join(lines))
        
        print(f"Flight plan with Callsign {callsign} deleted successfully.")
        return 1
    else:
        return 0

if __name__ == "__main__":
    file_path_arrival = 'Arrival.yaml'
    file_path_departure = 'Departure.yaml'

    if len(sys.argv) > 1:
        callsign_to_delete = sys.argv[1]
    else:
        callsign_to_delete = input("Enter Callsign to delete: ")

    arrival = delete_flight_plan(file_path_arrival, callsign_to_delete)
    departure = delete_flight_plan(file_path_departure, callsign_to_delete)

    if arrival == 0 and departure == 0:
        print(f"Flight plan with Callsign {callsign_to_delete} unable to delete.")
