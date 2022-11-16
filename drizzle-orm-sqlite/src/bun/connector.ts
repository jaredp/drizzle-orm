import { Database, Statement } from 'bun:sqlite';
import { Logger, MigrationConfig, readMigrationFiles } from 'drizzle-orm';
import { SQLiteSyncDatabase } from '~/db';
import { SQLiteSyncDialect } from '~/dialect';
import { SQLiteBunDriver } from './driver';
import { SQLiteBunSession } from './session';

export interface SQLiteBunConnectorOptions {
	logger?: Logger;
	dialect?: SQLiteSyncDialect;
	driver?: SQLiteBunDriver;
}

export type SQLiteBunDatabase = SQLiteSyncDatabase<Statement<any, any>, void>;

export class SQLiteBunConnector {
	dialect: SQLiteSyncDialect;
	driver: SQLiteBunDriver;
	private session: SQLiteBunSession | undefined;

	constructor(client: Database, options: SQLiteBunConnectorOptions = {}) {
		this.dialect = new SQLiteSyncDialect();
		this.driver = new SQLiteBunDriver(client, this.dialect, { logger: options.logger });
	}

	private getSession() {
		return this.session ?? (this.session = this.driver.connect());
	}

	connect(): SQLiteBunDatabase {
		const session = this.getSession();
		return new SQLiteSyncDatabase(this.dialect, session);
	}

	migrate(config: string | MigrationConfig) {
		const migrations = readMigrationFiles(config);
		const session = this.getSession();
		this.dialect.migrate(migrations, session);
	}
}