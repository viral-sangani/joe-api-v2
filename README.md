<div id="top"></div>

[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![MIT License][license-shield]][license-url]
[![LinkedIn][linkedin-shield]][linkedin-url]

<!-- PROJECT LOGO -->
<br />
<div align="center">

  <h3 align="center">Trader Joe API v2</h3>

  <p align="center">
    API for Trader Joe to calculate TVL, APR, APY and much more
    <br />
    <a href="https://documenter.getpostman.com/view/13371978/UVeDs7Pt"><strong>Explore the docs »</strong></a>
    <br />
    <br />
    <a href="https://joe-api-v2.herokuapp.com/">View Demo</a>
    ·
    <a href="https://github.com/viral-sangani/joe-api-v2/issues">Report Bug</a>
    ·
    <a href="https://github.com/viral-sangani/joe-api-v2/issues">Request Feature</a>
  </p>
</div>

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
    <li><a href="#acknowledgments">Acknowledgments</a></li>
  </ol>
</details>

<!-- ABOUT THE PROJECT -->
## About The Project

[![Poster Image][product-screenshot]](https://joe-api-v2.herokuapp.com/)

This is a project submission for Morlist + Avalanche Hackathon. Task was to create a set of APIs to calculate APY, APR and TVL for Trader Joe's Platform. The `joe-api-v2` has following features -

- Versioning support, currently has v1 and v2 API paths.
- Backwards compatible with [joe-api](https://github.com/traderjoe-xyz/joe-api). All the `joe-api` APIs are available at `https://joe-api-v2.herokuapp.com/v1/`.
- All the new APIs are available at - `https://joe-api-v2.herokuapp.com/v2/`.
- Awesome API documentation available here - [Postman Documentation](https://documenter.getpostman.com/view/13371978/UVeDs7Pt)
- Always returns a json object in response.
- Have rate limiting configuration. Each user/IP can make 1000 API call in 15 mins.
- Implemented caching to provide blazing fast response.
- Cache is auto updated once the data is expired by timely jobs.
- Build with typescript for better developer experience.
- Has great loggin feature to debug the production app.

<p align="right">(<a href="#top">back to top</a>)</p>

### Built With

- [NodeJS](https://nodejs.org/en/)
- [ExpressJS](https://expressjs.com/)
- [Typescript](https://www.typescriptlang.org/)
- [Trader Joe Contracts](https://traderjoexyz.com/)
- [The Graph](https://thegraph.com/)
- [Love ❤️](https://c.tenor.com/U45Q8YaJzBUAAAAC/moti-hearts.gif)

<p align="right">(<a href="#top">back to top</a>)</p>

<!-- GETTING STARTED -->
## Getting Started

To get a local copy up and running follow these simple steps.

### Prerequisites

- Nodejs (14.x or higher)
- yarn

  ```sh
  npm install --global yarn
  ```

### Installation

1. Clone the repo

   ```sh
   git clone https://github.com/viral-sangani/joe-api-v2
   ```

2. Install NPM packages

   ```sh
   yarn
   ```

<p align="right">(<a href="#top">back to top</a>)</p>

<!-- USAGE EXAMPLES -->
## Usage

1. Start the API server

   ```sh
   yarn start
   ```

2. Refer [documentation](https://documenter.getpostman.com/view/13371978/UVeDs7Pt) for testing endpoints

<p align="right">(<a href="#top">back to top</a>)</p>

<!-- CONTRIBUTING -->
## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".
Don't forget to give the project a star! Thanks again!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

<p align="right">(<a href="#top">back to top</a>)</p>

<!-- LICENSE -->
## License

Distributed under the MIT License. See `LICENSE.txt` for more information.

<p align="right">(<a href="#top">back to top</a>)</p>

<!-- CONTACT -->
## Contact

Viral Sangani - [@viral_sangani](https://twitter.com/viral_sangani_) - viral.sangani2011@gmail.com

Project Link: [https://github.com/viral-sangani/joe-api-v2](https://github.com/viral-sangani/joe-api-v2)

<p align="right">(<a href="#top">back to top</a>)</p>

<!-- ACKNOWLEDGMENTS -->
## Acknowledgments

List of resources I find helpful and would like to give credit to.

- [Trader Joe Documentation](https://traderjoexyz.com/)
- [Trader Joe Analytics Dashboard](https://analytics.traderjoexyz.com/)
- [CREAM Finance Lending contract docs](https://docs.cream.finance/developer/crtokens)
- [Trader Joe Exchange subgraph](https://thegraph.com/hosted-service/subgraph/traderjoe-xyz/exchange)
- [Trader Joe Masterchef subgraph](https://thegraph.com/hosted-service/subgraph/traderjoe-xyz/masterchefv2)
- [Trader Joe Lending subgraph](https://thegraph.com/hosted-service/subgraph/traderjoe-xyz/lending)

<p align="right">(<a href="#top">back to top</a>)</p>

<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
[contributors-shield]: https://img.shields.io/github/contributors/viral-sangani/joe-api-v2.svg?style=for-the-badge
[contributors-url]: https://github.com/viral-sangani/joe-api-v2/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/viral-sangani/joe-api-v2.svg?style=for-the-badge
[forks-url]: https://github.com/viral-sangani/joe-api-v2/network/members
[stars-shield]: https://img.shields.io/github/stars/viral-sangani/joe-api-v2.svg?style=for-the-badge
[stars-url]: https://github.com/viral-sangani/joe-api-v2/stargazers
[issues-shield]: https://img.shields.io/github/issues/viral-sangani/joe-api-v2.svg?style=for-the-badge
[issues-url]: https://github.com/viral-sangani/joe-api-v2/issues
[license-shield]: https://img.shields.io/github/license/viral-sangani/joe-api-v2.svg?style=for-the-badge
[license-url]: https://github.com/viral-sangani/joe-api-v2/blob/main/LICENSE.txt
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=for-the-badge&logo=linkedin&colorB=555
[linkedin-url]: https://www.linkedin.com/in/viral-sangani/
[product-screenshot]: images/product-image.png
