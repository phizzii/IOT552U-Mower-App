<a id="readme-top"></a>

<!-- PROJECT SHIELDS -->
[![Issues][issues-shield]][issues-url]
[![project_license][license-shield]][license-url]
[![LinkedIn][linkedin-shield]][linkedin-url]

<h3 align="center">Yr 2 IOT552U Business Organisation Project 💫</h3>

  <p align="center">
    This repository contains the second project for the IOT552U Business Organisation and Decision Making Module. 
    <br />
    <a href="https://github.com/phizzii/DAT5501-Final-Project"><strong>Explore the docs »</strong></a>

<p align="center">⋆｡ﾟ☁︎｡⋆｡ ﾟ☾ ﾟ｡⋆ ─── ⋆⋅☆⋅⋆ ─── ⋆｡ﾟ☁︎｡⋆｡ ﾟ☾ ﾟ｡⋆ ─── ⋆⋅☆⋅⋆ ─── ⋆｡ﾟ☁︎｡⋆｡ ﾟ☾ ﾟ｡⋆ ─── ⋆⋅☆⋅⋆ ─── ⋆｡ﾟ☁︎｡⋆｡ ﾟ☾ ﾟ｡⋆</p>

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li><a href="#about-the-project">About the Project</a></li>
    <li><a href="#assignment-context">Assignment Context</a></li>
    <li><a href="#the-business-problem">The Business Problem</a></li>
    <li><a href="#who-this-is-for">Who This Is For</a></li>
    <li><a href="#what-the-system-does">What the System Does</a></li>
    <li><a href="#value-of-the-solution">Value of the Solution</a></li>
    <li>
      <a href="#built-with">Built With</a>
      <ul>
        <li><a href="#frontend">Frontend</a></li>
        <li><a href="#backend">Backend</a></li>
        <li><a href="#tools--supporting-software">Tools & Supporting Software</a></li>
      </ul>
    </li>
    <li><a href="#repository-structure">Repository Structure</a></li>
    <li><a href="#getting-started">Getting Started</a></li>
    <li><a href="#installation-and-setup">Installation and Setup</a></li>
    <li><a href="#database-setup">Database Setup</a></li>
    <li><a href="#running-the-application">Running the Application</a></li>
    <li><a href="#core-features">Core Features</a></li>
    <li><a href="#reporting-and-analytics">Reporting and Analytics</a></li>
    <li><a href="#manual-api-testing">Manual API Testing</a></li>
    <li><a href="#roadmap--future-improvements">Roadmap / Future Improvements</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
  </ol>
</details>

<!-- ABOUT THE PROJECT -->
## About the Project

This repository contains a university assignment project based on an authentic small business scenario.

The project develops a prototype relational data solution for a small machine repair and sales business. The solution is designed to replace fragmented spreadsheet- and note-based processes with a more structured system for managing:

- customers
- customer-owned machines
- repair jobs
- parts and services
- invoices
- sale items
- deliveries
- reporting and dashboard analytics

This project combines a **SQLite relational database**, an Express / Node.js API, and a React frontend to demonstrate both database implementation and the business intelligence value of connected operational data.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- ASSIGNMENT CONTEXT -->
## Assignment Context

This project was created for the IOT552U Business Organisation and Decision Making module.

The assignment required the design and implementation of a complete data solution including:

- a relational data model
- a database implementation
- sample data
- data reporting and visualisation
- evidence of how the system supports data-driven decision-making in a real-world context

This repository acts as the practical implementation of that work.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- BUSINESS PROBLEM -->
## The Business Problem

The project is based on the needs of a small, single-site mower / machine repair business.

Before this prototype, information was managed through a mixture of:

- memory-based note taking
- spreadsheet tabs
- informal records
- manually tracked repair and invoicing details

This creates problems such as:

- fragmented customer and machine history
- difficulty tracking incomplete jobs
- duplicated or inconsistent records
- weak visibility of revenue and delivery costs
- limited reporting for business decisions

Because the data is highly interrelated, a spreadsheet-only approach becomes difficult to manage over time. A relational database is more appropriate for preserving linked records, enforcing structure and supporting reporting across multiple business activities.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- WHO IT IS FOR -->
## Who This Is For

This system is designed primarily for:

- a small workshop owner / operator
- a business that manages repairs, sales, invoicing and deliveries
- a user who needs a simple interface for both record keeping and business insight

Although the current prototype is focused on a one-person business, the structure could be extended in future for broader multi-user use.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- WHAT IT DOES -->
## What the System Does

The application allows the user to:

- create, view, edit and delete customer records
- register customer-owned machines
- log and manage repair jobs
- attach labour/services and parts to jobs
- manage invoices and sale items
- manage delivery-related information
- view dashboard metrics and analytical reports
- explore revenue, workload, customer value and logistics trends

The app is intended to support both day-to-day operational workflows and higher-level decision-making!

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- VALUE -->
## Value of the Solution

This prototype brings value by helping the business:

- centralise operational records in one structured system
- improve traceability across customers, machines and repairs
- reduce reliance on fragmented spreadsheets and notes
- support more consistent invoicing and delivery tracking
- surface trends through reporting and visualisation
- identify incomplete jobs, service revenue, customer value and delivery efficiency

In short, the project demonstrates how a small business can move from reactive record keeping to a more data-informed way of working.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- BUILT WITH -->
## Built With

### Frontend

- [React][react-url]
- React Router
- CSS
- Leaflet / React Leaflet
- Anime.js

### Backend

- [Node.js][node.js-url]
- Express
- SQLite
- sqlite3
- dotenv
- cors

### Tools & Supporting Software

- Visual Studio Code
- Lucidchart
- GitHub

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- REPOSITORY STRUCTURE -->
## Repository Structure

```text
client/
  public/
  src/
    components/
    hooks/
    pages/
    utils/
  package.json

server/
  db/
    db.js
    schema.sql
    seed.sql
    seed.js
  routes/
  utils/
  package.json

API_TEST_CHECKLIST.md
README.md
```

<!-- LICENSE -->
## License

MIT license for learning :)!

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- CONTACT -->
## Contact

Sophie - [@VolarPhizzie](https://x.com/VolarPhizzie)

Project Link: [https://github.com/phizzii/IOT552U-Mower-App](https://github.com/phizzii/IOT552U-Mower-App)

LinkedIn: [Add me here!!](https://www.linkedin.com/in/sophie-botten-82a91227a/)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- ACKNOWLEDGMENTS -->
## Citations

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
[issues-shield]: https://img.shields.io/github/issues/phizzii/IOT552U-Mower-App.svg?style=for-the-badge
[issues-url]: https://github.com/phizzii/IOT552U-Mower-App/issues
[license-shield]: https://img.shields.io/github/license/phizzii/IOT552U-Mower-App.svg?style=for-the-badge
[license-url]: https://github.com/phizzii/IOT552U-Mower-App/LICENSE.md
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=for-the-badge&logo=linkedin&colorB=555
[linkedin-url]: https://www.linkedin.com/in/sophie-botten-pineda-82a91227a/
<!-- Shields.io badges. You can a comprehensive list with many more badges at: https://github.com/inttter/md-badges -->

[React]: https://img.shields.io/badge/react-1bc908?style=for-the-badge&logo=react&logoColor=white
[react-url]: https://react.dev/

[Node.JS]: https://img.shields.io/badge/node.js-0875c9?style=for-the-badge&logo=nodejs&logoColor=white
[node.js-url]: https://nodejs.org/en

[SQL]: https://img.shields.io/badge/sql-7f08c9?style=for-the-badge&logo=sql&logoColor=white
[sql-url]: https://www.w3schools.com/sql/
