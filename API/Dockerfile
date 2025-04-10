FROM python:3.10-alpine

ENV PYTHONDONTWRITEBYTESCODE 1
ENV PYTHONBUFFERED 1

RUN mkdir /backend_app
WORKDIR /backend_app

COPY . /backend_app

RUN pip install --no-cache-dir -r requirements.txt

EXPOSE 8080

COPY ./wait-for-db.sh .
RUN chmod +x ./wait-for-db.sh
ENTRYPOINT [ "./wait-for-db.sh" ]

CMD ["python", "./main.py"]