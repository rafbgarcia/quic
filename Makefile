dbpush:
	npx prisma db push # --accept-data-loss --force-reset
	npx prisma generate

server:
	npx next dev -p 8000
