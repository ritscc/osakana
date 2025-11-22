FROM rust:1.91-bookworm as builder
WORKDIR /usr/src/server
COPY . .
RUN cargo install --path .

FROM debian:bookworm-slim
COPY --from=builder /usr/local/cargo/bin/server /usr/local/bin/server
CMD ["server"]
