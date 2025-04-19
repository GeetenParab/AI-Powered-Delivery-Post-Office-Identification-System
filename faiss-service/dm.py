import csv

# Input and output file paths
input_file = "ho_offices.csv"  # Update this to your input file path
output_file = "maharashtra_ho_offices.csv"  # Output file for Maharashtra HO offices

# Read the CSV file and filter for Maharashtra HO offices
maharashtra_ho_offices = []
try:
    with open(input_file, 'r', encoding='utf-8') as csvfile:
        # Check if the first line contains headers or data
        first_line = csvfile.readline().strip()
        csvfile.seek(0)  # Reset to beginning of file
        
        # Determine if the first line is a header or data
        if "CircleName" in first_line and "RegionName" in first_line:
            # File has header
            reader = csv.DictReader(csvfile)
            headers = reader.fieldnames
            
            # Filter offices with OfficeType = HO and StateName = MAHARASHTRA
            for row in reader:
                if row['OfficeType'] == 'HO' and row['StateName'] == 'MAHARASHTRA':
                    maharashtra_ho_offices.append(row)
                    print(f"Found Maharashtra HO office: {row['OfficeName']} in {row['District']}")
        else:
            # File doesn't have header, use the header line from your example
            headers = ["CircleName", "RegionName", "DivisionName", "OfficeName", 
                      "Pincode", "OfficeType", "Delivery", "District", "StateName", 
                      "Latitude", "Longitude"]
            reader = csv.reader(csvfile)
            
            # Filter offices with OfficeType = HO (index 5) and StateName = MAHARASHTRA (index 8)
            for row in reader:
                if len(row) >= 9 and row[5] == 'HO' and row[8] == 'MAHARASHTRA':
                    office_dict = {headers[i]: row[i] for i in range(min(len(headers), len(row)))}
                    maharashtra_ho_offices.append(office_dict)
                    print(f"Found Maharashtra HO office: {row[3]} in {row[7]}")
    
    # Write the filtered data to a new CSV file
    if maharashtra_ho_offices:
        with open(output_file, 'w', newline='', encoding='utf-8') as outfile:
            writer = csv.DictWriter(outfile, fieldnames=headers)
            writer.writeheader()
            writer.writerows(maharashtra_ho_offices)
        print(f"\nSuccessfully created {output_file} with {len(maharashtra_ho_offices)} Maharashtra HO offices")
    else:
        print("\nNo Head Offices (HO) in Maharashtra found in the data")
    
    # Print details of all Maharashtra HO offices
    print("\nDetails of all Maharashtra Head Offices (HO):")
    print("-" * 80)
    for i, office in enumerate(maharashtra_ho_offices, 1):
        print(f"Office #{i}:")
        for key, value in office.items():
            print(f"  {key}: {value}")
        print("-" * 40)

except FileNotFoundError:
    print(f"Error: Could not find the input file '{input_file}'")
    print("Make sure to update the 'input_file' variable with the correct path to your CSV file")
except Exception as e:
    print(f"An error occurred: {e}")