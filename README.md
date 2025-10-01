# Mottu App — Gerenciamento de Frotas e Manutenção de Motos

> **IMPORTANTE:** Para o melhor funcionamento do projeto, recomenda-se utilizar o **emulador Pixel 6 Pro** no Android Studio, pois ele oferece a melhor compatibilidade visual com os componentes utilizados, especialmente os modais e mapas.

## Proposta e Funcionalidades

O objetivo principal do aplicativo é fornecer uma ferramenta móvel para administradores de frota, permitindo o registro, visualização e gestão de motocicletas e dos seus respetivos ciclos de manutenção.

### Funcionalidades Implementadas

* **Sistema de Autenticação Completo:**
    * Tela de Login com validação de campos e feedback de erros.
    * Tela de Cadastro de novos utilizadores.
    * Autenticação baseada em tokens JWT, com persistência da sessão do utilizador.
    * Funcionalidade de Logout para encerrar a sessão de forma segura.

* **Gestão de Motos (CRUD):**
    * Cadastro de novas motocicletas com informações de placa, ano e modelo.
    * Listagem completa de todas as motos cadastradas.
    * Funcionalidade de busca por placa.
    * Exclusão de motos da frota.
    * Um campo adicional ("Chassi") é gerido localmente no dispositivo através do `AsyncStorage` para demonstrar um modelo de dados híbrido.

* **Gestão de Manutenções (CRUD):**
    * Registo de novos pedidos de manutenção, associando-os a uma moto existente.
    * Listagem de todo o histórico de manutenções.
    * Atualização do status de uma manutenção para "Concluída".
    * Sistema de exclusão lógica (soft delete): ao excluir, a manutenção é removida da API, mas uma cópia é mantida no histórico local do dispositivo com o status "excluído".

* **Visualização de Frota:**
    * **Pátio Digital:** Uma tela que exibe a frota de forma visual, separando as motos disponíveis daquelas que estão em manutenção.
    * **Mapa de Localização:** Um mapa interativo que mostra a localização geográfica (gerada aleatoriamente e persistida) de todas as motos que estão **disponíveis** para uso.

* **Experiência do Utilizador:**
    * **Tema Dinâmico (Modo Claro/Escuro):** Suporte completo a temas, com um botão no cabeçalho para alternar entre o modo claro e escuro em toda a aplicação.
    * **Indicadores de Carregamento:** Todas as telas que consomem dados da API exibem um indicador de carregamento com duração mínima de 1.5 segundos para garantir uma transição suave.
    * **Feedback ao Utilizador:** Uso de alertas para fornecer feedback sobre o sucesso ou falha das operações (cadastro, erros de login, etc.).

## Tecnologias Utilizadas

* **React Native com Expo**
* **TypeScript** para tipagem estática e segurança do código.
* **Expo Router** para a navegação baseada em ficheiros e rotas.
* **Axios** para a comunicação com a API RESTful.
* **React Context API** para a gestão de estado global (autenticação do utilizador e tema).
* **React Native Maps** para a funcionalidade de geolocalização.
* **React Native Dropdown Picker** para campos de seleção.
* **AsyncStorage** para persistência de dados locais (token de sessão, chassi, coordenadas, etc.).

## Estrutura de Pastas

A estrutura de pastas do projeto foi organizada de maneira clara para separar as responsabilidades e facilitar a manutenção:

- **`/mottu`**: Diretório principal do projeto.

  - **`app/`**: Contém todas as rotas e telas da aplicação, utilizando o Expo Router.
  
    - **`(tabs)/`**: Contém as telas principais que são exibidas após o login.
    - **`_layout.tsx`**: Arquivo que define o layout raiz da aplicação.
    - **`index.tsx`**: Tela de Login.
    - **`register.tsx`**: Tela de Cadastro.

  - **`assets/`**: Contém arquivos estáticos, como imagens e fontes utilizadas no aplicativo.
  
  - **`components/`**: Contém componentes reutilizáveis em várias partes do aplicativo, como o Header, Ícones, etc.
  
  - **`constants/`**: Contém as constantes da aplicação, como as cores, estilos do mapa, e temas.
  
  - **`context/`**: Responsável pela gestão do estado global, incluindo os contextos de tema (`ThemeContext`) e autenticação de usuário (`UserContext`).
  
  - **`services/`**: Camada de serviços para comunicação com a API, incluindo arquivos como `api.ts` para lidar com as requisições.
  
  - **`...`**: Outros arquivos de configuração do projeto, como `package.json`, `tsconfig.json`, entre outros.



---

## Configuração do Ambiente de Desenvolvimento

Para que o aplicativo mobile funcione corretamente, é essencial que a API backend (.NET) esteja em execução na sua máquina local e que o aplicativo saiba como se conectar a ela.

### Passo 1: Executar a API Backend

1.  Clone o repositório da API a partir do seguinte link: `https://github.com/tcguus/Mottu-API`
2.  Abra o projeto da API utilizando a IDE JetBrains Rider.
3.  Execute o projeto. Por padrão, a API irá rodar na porta `5075`.

### Passo 2: Configurar a Conexão no App Mobile

O aplicativo precisa saber o endereço de IP da sua máquina na rede local para se comunicar com a API.

1.  **Encontre o seu Endereço IPv4:**
    * Abra o **Prompt de Comando (cmd)** no seu Windows.
    * Digite o comando `ipconfig` e pressione Enter.
    * Procure pela sua conexão de rede (geralmente "Adaptador de LAN sem Fio Wi-Fi") e anote o valor do **"Endereço IPv4"**. Ele será algo como `192.168.1.10`.

2.  **Atualize o Ficheiro de Configuração da API:**
    * No projeto do aplicativo mobile, abra o ficheiro: `services/api.ts`.
    * Encontre a linha que define a `const API_URL`.
    * Substitua o endereço de IP existente pelo **Endereço IPv4** que você anotou, mantendo a porta `:5075`.

    **Exemplo:**
    ```typescript
    // Mude de:
    const API_URL = "[http://12.34.567.890:5075/api/v1]";

    // Para (usando o seu IP):
    const API_URL = "[http://192.168.1.10:5075/api/v1]";
    ```

Após seguir estes passos, a API estará a rodar e o aplicativo mobile estará configurado para se conectar a ela.

## Como Executar o Projeto

**Pré-requisitos:**
* Node.js e npm/yarn instalados.
* Aplicação Expo Go instalada no seu telemóvel (Android/iOS) ou um emulador configurado.
* A API Backend deve estar em execução conforme as instruções acima.


**Passos**:

1) Clone o repositório e acesse a pasta do projeto:
```bash
git clone https://github.com/tcguus/Mottu
cd mottu
```

2) Instale o npm:
```bash
npm install
```

3) Rode o projeto:
```bash
npx expo start 
```

4) Acesse o projeto:  
`http://localhost:3000`
---

## Nossos integrantes
- **Gustavo Camargo de Andrade**
- RM555562
- 2TDSPF
-------------------------------------------
- **Rodrigo Souza Mantovanello**
- RM555451
- 2TDSPF
-------------------------------------------
- **Leonardo Cesar Rodrigues Nascimento**
- RM558373
- 2TDSPF

