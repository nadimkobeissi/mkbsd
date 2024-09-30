FROM --platform=${BUILDPLATFORM} python:3.9.20-slim-bookworm

RUN pip install aiohttp
VOLUME /app/downloads

WORKDIR /app
COPY mkbsd.py .

CMD ["python", "mkbsd.py"]

