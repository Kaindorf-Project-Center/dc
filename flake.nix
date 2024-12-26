{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
  };

  outputs = {
    systems,
    nixpkgs,
    ...
  } @ inputs: let
    eachSystem = f: nixpkgs.lib.genAttrs (import systems) (system: f nixpkgs.legacyPackages.${system});
  in {
    devShells = eachSystem (pkgs: {
      default = pkgs.mkShell {
        buildInputs = with pkgs; [
          pre-commit
          act
          nodejs_22

          bun

          eslint
          (nodePackages.prettier.overrideAttrs (oldAttrs: {
            version = "2.1.0";
            src = pkgs.fetchurl {
              url = "https://registry.npmjs.org/prettier/-/prettier-2.1.0.tgz";
              sha256 = "sha256-HsANzK9TuVK0yirLwMmXUbwpTdfDIiIRsCwE+487GDU=";
            };
          }))
          nodePackages.typescript
          nodePackages.typescript-language-server
        ];

        # Automatically run `pre-commit install` when entering the shell
        shellHook = ''
          echo "Installing pre-commit hooks..."
          pre-commit install
        '';
      };
    });
  };
}
