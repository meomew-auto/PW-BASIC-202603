import {
  auth,
  type AuthFixture,
  type ProjectWorkerAuthFixture,
} from "./auth.fixture";
import { appFixtures, type AppFixture } from "./app.fixture";

export type ProjectWorkerGatekeeperFixture =
  & AuthFixture
  & ProjectWorkerAuthFixture
  & AppFixture;

export const test = auth.extend<ProjectWorkerGatekeeperFixture>({
  ...appFixtures,
});

export { expect } from "@playwright/test";
