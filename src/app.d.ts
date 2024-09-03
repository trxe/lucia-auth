// See https://kit.svelte.dev/docs/types#app

import type { DatabaseUserAttributes } from "$lib/server/auth";

// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			user: DatabaseUserAttributes | null;
			session: import("lucia").Session | null;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export { };
