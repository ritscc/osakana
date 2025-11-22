FROM rust:1.91-bookworm AS builder
WORKDIR /usr/src/server
COPY . .
RUN --mount=type=cache,target=/usr/local/cargo/registry \
	  --mount=type=cache,target=/usr/src/server/target \
    cargo install --path .

FROM debian:bookworm-slim
COPY --from=builder /usr/local/cargo/bin/server /usr/local/bin/server
CMD ["server"]
