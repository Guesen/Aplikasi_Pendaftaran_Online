# **App Name**: Mrebet Queue

## Core Features:

- Welcome Screen Display: Display the initial screen with the government logos, puskesmas logo, and two large buttons for selecting the queue type (Loket A or Loket B).
- Queue Selection: Allow users to select either 'Loket A - Pasien Biasa' or 'Loket B - Balita Ibu Hamil & Lansia' by tapping the corresponding button.
- Instant Ticket Printing: Automatically send a print command to the thermal printer immediately after a queue selection button is tapped. The print command should automatically format and contain the necessary information.
- Ticket Content Generation: Dynamically generate the ticket content including the puskesmas name, queue number (A or B followed by a 3-digit sequence), service name, and timestamp. Reset to 001 at midnight daily using a tool.
- Thermal Printer Communication: Establish and maintain a direct connection with the thermal printer (via USB or network) to send print commands formatted for the printer's specifications.
- Real-time Number Sequencing: Automatically sequence tickets from each counter independently. Loket A and Loket B numbering must be tracked independent of each other

## Style Guidelines:

- Background color: Light beige/cream (#F5F5DC) for a soft and clean look. This aligns with a healthcare setting's need for a calm, non-clinical environment.
- Primary color: Bright blue (#007BFF) for buttons, providing contrast and signaling interactivity. The choice of blue evokes trust and professionalism, mirroring common expectations for such applications. It should contrast well with the background to increase readability.
- Accent color: Light yellow (#FFFFE0) for text on the blue buttons, ensuring high contrast and legibility. The use of yellow-tinted text against blue buttons aids users in clearly distinguishing actions, fitting seamlessly into intuitive user interaction principles.
- Font: 'PT Sans' (sans-serif) in bold for all text elements to ensure readability from a distance, per user request. Note: currently only Google Fonts are supported.
- Two vertically arranged large buttons on the main screen for easy touch interaction.
- Display government logos on the top left and puskesmas/health logo on the top right of the main screen.