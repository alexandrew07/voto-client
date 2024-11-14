import electionImage from "/public/create-election.svg";
import voterImage from "/public/create-voter.svg";
import candidateImage from "/public/create-candidate.svg";
import manageElection from "/public/manage-election.svg";
import analytics from "/public/analytics.svg";
import settings from "/public/settings.svg";

export const organisationLinks = [
  { label: "Overview", image: electionImage, link: "/organisation" },
  {
    label: "Elections",
    image: electionImage,
    link: "/organisation/elections",
  },
  { label: "Voters", image: voterImage, link: "/organisation/voters" },
  {
    label: "Candidates",
    image: candidateImage,
    link: "/organisation/candidates",
  },
  //   { label: "Manage Election", image: manageElection, link: "/posts" },
  // { label: "Messages", image: analytics, link: "/report" },
  { label: "Wallet", image: analytics, link: "/organisation/wallet" },
  { label: "Settings", image: settings, link: "/organisation/settings" },
];
