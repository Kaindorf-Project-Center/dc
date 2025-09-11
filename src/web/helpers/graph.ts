import type { AuthProvider, Options } from '@microsoft/microsoft-graph-client';
import { Client } from '@microsoft/microsoft-graph-client';

export const graphClientWithToken = (accessToken: string) => {
	const authProvider: AuthProvider = (done) => {
		// success: error=null, token=string
		done(null, accessToken);
	};

	const options: Options = { authProvider, defaultVersion: 'v1.0' };
	return Client.init(options);
};
// TODO: cleanup
export const graphAppClient = (
	getAppToken: () => Promise<{ data: string; error?: unknown }>
) => {
	const authProvider: AuthProvider = (done) => {
		void getAppToken()
			.then((t) => {
				if (t.error) {
					const err =
						t.error instanceof Error
							? t.error
							: new Error(
									typeof t.error === 'string'
										? t.error
										: JSON.stringify(t.error)
							  );
					// error path: supply BOTH args; token can be empty string
					done(err, '');
					return;
				}

				// success
				done(null, t.data);
			})
			.catch((e: unknown) => {
				const err = e instanceof Error ? e : new Error(String(e));
				done(err, '');
			});
	};

	const options: Options = { authProvider, defaultVersion: 'v1.0' };
	return Client.init(options);
};
