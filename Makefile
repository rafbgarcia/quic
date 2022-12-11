dbpush:
	npx prisma db push

dbreset:
	npx prisma db push --accept-data-loss --force-reset

server:
	npx next dev -p 8000
