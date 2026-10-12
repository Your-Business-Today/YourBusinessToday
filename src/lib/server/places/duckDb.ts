import { DuckDBInstance } from '@duckdb/node-api';
import { overtureRegion } from './overtureQueries';

/** One in-memory DuckDB that can read parquet over HTTPS and S3 anonymously, as Overture's own examples do. */
export type ParquetReader = { rows: (query: string) => Promise<Record<string, unknown>[]>; close: () => void };

export async function openParquetReader(): Promise<ParquetReader> {
	const instance = await DuckDBInstance.create(':memory:');
	const connection = await instance.connect();
	await connection.run('install httpfs; load httpfs;');
	await connection.run(`set s3_region = '${overtureRegion}';`);
	return {
		rows: async (query) => {
			const reader = await connection.runAndReadAll(query);
			return reader.getRowObjectsJson() as Record<string, unknown>[];
		},
		close: () => connection.closeSync()
	};
}
