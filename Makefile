dbpush:
	npx prisma db push

dbreset:
	npx prisma db push --accept-data-loss --force-reset

dbproxy:
	pscale connect quic main --port 3309 --org quic

server:
	npx next dev -p 8000
