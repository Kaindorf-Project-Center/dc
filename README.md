# `dc`

Make sure you have the following installed:

- [Nix](https://nixos.org/)
- [Direnv](https://direnv.net/)
- [Nix-direnv](https://github.com/nix-community/nix-direnv)

Then, in the project root, run:

```bash
direnv allow
```

That's it! Don't forget to set correct values for the variables mentioned in the `.env.example`.

---

To install dependencies:

```bash
bun install
```

--- 

To run:

```bash
bun run index.ts
```

This project was created using `bun init` in bun v1.1.38. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.
