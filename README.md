# AI Video Interview Platform
  
This is a project built with [Chef](https://chef.convex.dev) using [Convex](https://convex.dev) as its backend.
 You can find docs about Chef with useful information like how to deploy to production [here](https://docs.convex.dev/chef).

## Developer docs

For codebase maintenance, architecture notes, and operational runbooks, see:

- [DEV_MAINTENANCE.md](./DEV_MAINTENANCE.md)
  
This project is connected to the Convex deployment named [`quaint-hyena-836`](https://dashboard.convex.dev/d/quaint-hyena-836).
  
## Project structure

The frontend code is in the `src` directory and is built with [Vite](https://vitejs.dev/).

The backend code is in the `convex` directory.
  
`npm run dev` will start the frontend and backend servers.

## App authentication

This app uses [Convex Auth](https://auth.convex.dev/) with the Password provider.

## Developing and deploying your app

Check out the [Convex docs](https://docs.convex.dev/) for more information on how to develop with Convex.
* If you're new to Convex, the [Overview](https://docs.convex.dev/understanding/) is a good place to start
* Check out the [Hosting and Deployment](https://docs.convex.dev/production/) docs for how to deploy your app
* Read the [Best Practices](https://docs.convex.dev/understanding/best-practices/) guide for tips on how to improve you app further

## HTTP API

User-defined http routes are defined in the `convex/router.ts` file. We split these routes into a separate file from `convex/http.ts` to allow us to prevent the LLM from modifying the authentication routes.

## HRMS Integration API

The app now exposes bearer-token HTTP endpoints for pulling hiring data into an external HRMS.

Create and revoke API keys from the authenticated app under `Settings` → `HRMS API`.

Available endpoints:

- `GET /api/hrms/job-profiles`
- `GET /api/hrms/interviews`
- `GET /api/hrms/interview-detail?interviewId=<convex-id>`

Authentication:

- Send `Authorization: Bearer <hrms_api_key>`

Response scope:

- Each API key is scoped to the interviewer account that created it.
- Endpoints only return that interviewer’s job profiles, interviews, transcripts, and AI analysis.
