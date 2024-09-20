import _ from "lodash";
import { icons } from "../base-components/Lucide";
import users, { type User } from "./users";

export interface Event {
  id: string;
  title: string;
  description: string;
  location: string;
  date: string;
  time: string;
  icon: keyof typeof icons;
  organizer: string;
  attendees: Array<User>;
  availableSeats: number;
  registrationLink?: string;
  maxAttendees?: number;
}

const fakers = {
  fakeEvents() {
    const events: Array<Event> = [
      {
        id: "1",
        title: "Tech Conference",
        description: "Annual tech conference for developers",
        location: "City Convention Center",
        date: "2023-10-10",
        time: "09:00 AM",
        icon: "Hourglass",
        organizer: "Tech Events Inc.",
        attendees: users.fakeUsers(),
        availableSeats: _.random(1, 4),
        registrationLink: "https://left4code.com/tech-conference",
        maxAttendees: 500,
      },
      {
        id: "2",
        title: "Product Launch",
        description: "Launch event for our latest product",
        location: "Company Headquarters",
        date: "2023-10-15",
        time: "02:30 PM",
        icon: "Clock4",
        organizer: "Left4code",
        attendees: users.fakeUsers(),
        availableSeats: _.random(1, 4),
        registrationLink: "https://left4code.com/product-launch",
        maxAttendees: 200,
      },
      {
        id: "3",
        title: "Team Building Workshop",
        description: "Team-building activities and games",
        location: "City Park",
        date: "2023-10-20",
        time: "10:00 AM",
        icon: "Truck",
        organizer: "Team Builders Inc.",
        attendees: users.fakeUsers(),
        availableSeats: _.random(1, 4),
        registrationLink: "https://left4code.com/team-building",
        maxAttendees: 100,
      },
      {
        id: "4",
        title: "Marketing Workshop",
        description: "Workshop on modern marketing strategies",
        location: "Hotel Conference Room",
        date: "2023-10-25",
        time: "11:15 AM",
        icon: "PackageCheck",
        organizer: "Marketing Pro",
        attendees: users.fakeUsers(),
        availableSeats: _.random(1, 4),
        registrationLink: "https://left4code.com/marketing-workshop",
        maxAttendees: 150,
      },
      {
        id: "5",
        title: "Community Cleanup",
        description: "Volunteer event to clean up the neighborhood",
        location: "Community Center",
        date: "2023-10-28",
        time: "09:00 AM",
        icon: "PackageX",
        organizer: "Local Community Association",
        attendees: users.fakeUsers(),
        availableSeats: _.random(1, 4),
        registrationLink: "https://left4code.com/community-cleanup",
        maxAttendees: 50,
      },
      {
        id: "6",
        title: "Webinar: AI in Healthcare",
        description: "Online webinar on AI applications in healthcare",
        location: "Online",
        date: "2023-11-05",
        time: "03:00 PM",
        icon: "Wallet",
        organizer: "AI Experts",
        attendees: users.fakeUsers(),
        availableSeats: _.random(1, 4),
        registrationLink: "https://left4code.com/ai-webinar",
        maxAttendees: 300,
      },
      {
        id: "7",
        title: "Networking Mixer",
        description: "Networking event for professionals",
        location: "Downtown Lounge",
        date: "2023-11-10",
        time: "07:30 PM",
        icon: "ArrowLeftSquare",
        organizer: "Networking Pro",
        attendees: users.fakeUsers(),
        availableSeats: _.random(1, 4),
        registrationLink: "https://left4code.com/networking-mixer",
        maxAttendees: 80,
      },
      {
        id: "8",
        title: "Customer Workshop",
        description: "Hands-on workshop for our customers",
        location: "Company Training Center",
        date: "2023-11-18",
        time: "10:30 AM",
        icon: "FileX2",
        organizer: "Left4code",
        attendees: users.fakeUsers(),
        availableSeats: _.random(1, 4),
        registrationLink: "https://left4code.com/customer-workshop",
        maxAttendees: 120,
      },
      {
        id: "9",
        title: "Holiday Party",
        description: "Annual holiday celebration and party",
        location: "Grand Hotel Ballroom",
        date: "2023-12-15",
        time: "08:00 PM",
        icon: "PackageSearch",
        organizer: "Left4code",
        attendees: users.fakeUsers(),
        availableSeats: _.random(1, 4),
        registrationLink: "https://left4code.com/holiday-party",
        maxAttendees: 250,
      },
      {
        id: "10",
        title: "Company Retreat",
        description: "Team retreat in a scenic location",
        location: "Mountain Resort",
        date: "2023-12-28",
        time: "All Day",
        icon: "Package",
        organizer: "Left4code",
        attendees: users.fakeUsers(),
        availableSeats: _.random(1, 4),
        registrationLink: "https://left4code.com/company-retreat",
        maxAttendees: 60,
      },
    ];

    return _.shuffle(events);
  },
};

export default fakers;
