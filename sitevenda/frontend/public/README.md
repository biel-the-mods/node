# Datasets de modelos 3D (.glb/.gltf)

> Esta pasta guarda arquivos `.glb`/`.gltf` versionados SOMENTE para
> preview no repositório. Em produção, esses arquivos ficam no
> Supabase Storage (`artstore-bucket/produtos/modelos/`).

## Onde conseguir modelos gratuitos

- [Sketchfab](https://sketchfab.com/) — busque por "t-shirt" com licença CC
- [Poly Haven Models](https://polyhaven.com/models)
- [Khronos glTF Sample Models](https://github.com/KhronosGroup/glTF-Sample-Models)

## Como testar local

1. Suba um arquivo `exemplo.glb` aqui
2. No painel admin, cadastre o produto apontando para esse arquivo
   (ou sirva via `python3 -m http.server 8080` e use a URL
   `http://localhost:8080/exemplo.glb`)
