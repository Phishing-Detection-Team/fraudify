# Phishing Detection System

> **AI-Powered Email Security through Adversarial Training**

An intelligent email security system that uses frontier AI models in a three-agent architecture to detect phishing emails. The system employs competitive learning where a Generator creates realistic phishing emails, a Detector identifies them and continuously improving detection accuracy through offline training rounds.

---

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Current Implementation](#current-implementation)
- [Key Features](#key-features)
- [System Architecture](#system-architecture)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
- [Multi-Agent System Details](#multi-agent-system-details)
- [Project Status](#project-status)
- [Team](#team)
- [Documentation](#documentation)

---

## 🎯 Project Overview

### Purpose

This system addresses the growing sophistication of phishing attacks by using AI models that compete against each other to generate training data and improve detection accuracy. Unlike traditional rule-based filters, this approach continuously evolves to counter new attack techniques.

### Target Users

- **Individual email users** seeking personal email protection
- **Small business employees** lacking advanced cybersecurity awareness
- **Security operations teams** needing automated threat detection

### Success Metrics

- **Detection accuracy**: >85% precision, >80% recall
- **False positive rate**: <5%
- **Detection speed**: <5 seconds per email
- **System uptime**: 99%

---

## 🚀 Current Implementation

- ✅ Successfully ran all 3 agents (Generator, Detector, Orchestration) and saved results to PostgreSQL using Docker Compose via Semantic Kernel (`LLMs/` directory).
- ✅ Built a second agent implementation using **OpenAI Agents SDK** with LiteLLM multi-model routing (`openai-agentic/` directory).
- ✅ Verified OpenAI Agents SDK agents instantiate and connect to external LLMs (Gemini & Claude) end-to-end.
- ✅ Fixed all import/module issues, LiteLLM model routing, and async event loop handling in the `openai-agentic` implementation.
- 🚧 Now moving on to Redis caching and full Dockerization for backend services.
- 🧪 Next: Implementing unit tests for backend logic.
- 🖥️ Next: Starting frontend (React) dashboard development.


### Multi-Agent System — Semantic Kernel (`LLMs/` Directory)

A sophisticated multi-agent AI system using **Semantic Kernel orchestration** with AI-powered function calling where specialized agents compete in an adversarial competition.

#### 🏗️ Architecture

**Entity-Service Pattern with Optional Binding**
- **Entities**: Independent state holders (API keys, clients, configuration)
- **Services**: Flexible operation providers supporting dual-mode usage
- **Optional Binding**: Services can be bound to entities (for Semantic Kernel) or stateless (with entity parameter)
- **No Adapter Layer**: Services register directly with Semantic Kernel

#### 🎭 Agents

**1. Generator Agent (OpenAI GPT-4o)**
- **Goal**: Create highly convincing and sophisticated scam emails
- **Strategy**: Advanced psychological manipulation, authenticity engineering, subtle manipulation
- **Capabilities**:
  - Various scam types (phishing, lottery, Nigerian prince, tech support, CEO fraud)
  - Professional formatting and specific details
  - Social engineering tactics
- **Scoring**: Technical realism (0-25), psychological impact (0-25), subtlety factor (0-25), social engineering (0-25)

**2. Detector Agent (Claude Sonnet 4.5)**
- **Goal**: Detect and analyze sophisticated scam emails with comprehensive indicator analysis
- **Strategy**: Multi-layered analysis framework
  - **Layer 1**: Structural Analysis (sender, linguistics, formatting)
  - **Layer 2**: Content Analysis (urgency, information requests, financial indicators)
  - **Layer 3**: Psychological Analysis (emotional manipulation, social engineering)
  - **Layer 4**: Technical Analysis (links, attachments, anomalies)
- **Scoring**: Accuracy (0-25), analytical depth (0-25), indicator identification (0-25), reasoning quality (0-25)

**3. Orchestration Agent (OpenAI GPT-4o)**
- **Goal**: AI-powered workflow management using function calling
- **Strategy**: Automatically plans and executes the workflow
- **Capabilities**:
  - Intelligent agent coordination
  - Multi-round processing with status tracking
  - Cost calculation and performance metrics

#### Quick Start (LLMs Implementation)

```bash
# From repository root — single .env for all components (see root .env.example)
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your keys:
# OPENAI_API_KEY=your_key_here
# ANTHROPIC_API_KEY=your_key_here
# GOOGLE_API_KEY=your_key_here (optional, for Judge Agent)

cd LLMs
# Run the multi-agent competition
python main.py

# You'll be prompted for:
# - Number of rounds (default: 1)
# - Number of emails per round (default: 1)
```

#### Architecture Example

```python
# Entity-Service pattern with optional binding
from entities.generator_agent_entity import GeneratorAgentEntity
from services.generator_agent_service import GeneratorAgentService

# Create entity (configuration + API client)
entity = GeneratorAgentEntity()

# Bind entity to service for Semantic Kernel
service = GeneratorAgentService(entity=entity)

# Register directly with kernel (no adapter needed)
kernel.add_plugin(service, "generator")

# Service automatically uses bound entity
result = await service.generate_scam(scenario="phishing")
```

### Multi-Agent System — OpenAI Agents SDK (`openai-agentic/` Directory)

A second implementation of the multi-agent system using **OpenAI Agents SDK** (`openai-agents`) with **LiteLLM** for multi-model routing. This replaces Semantic Kernel orchestration with a lighter-weight approach using `agents.Runner` and `LitellmModel`.

#### 🏗️ Architecture

**Same Entity-Service Pattern** as the `LLMs/` implementation, adapted for OpenAI Agents SDK:
- **Entities**: Configure agent instances with `agents.Agent`, model via `LitellmModel`
- **Services**: Thin wrappers calling `Runner.run()` on entity agents
- **Prompts**: Shared centralized prompt templates (`utils/prompts.py`)
- **Orchestrator**: `main.py` coordinates parallel Generate → Detect workflows via `asyncio`

#### 🎭 Agents

**1. Generator Agent (Google Gemini 2.0 Flash)**
- **SDK**: OpenAI Agents SDK + LiteLLM (`gemini/gemini-2.0-flash`)
- **Goal**: Create phishing or legitimate emails (50/50 random split)
- **Output**: Structured JSON with email content, metadata, and ground truth label
- **Temperature**: 0.8 (high creativity)

**2. Detector Agent (Anthropic Claude 3.5 Haiku)**
- **SDK**: OpenAI Agents SDK + LiteLLM (`anthropic/claude-3-5-haiku-20241022`)
- **Goal**: Multi-layered phishing analysis (11 indicator framework)
- **Output**: Structured JSON with verdict, confidence, risk score, reasoning
- **Temperature**: 0.3 (consistent analytical output)

**3. Orchestrator (`main.py`)**
- **No LLM needed** — pure Python async coordination
- Divides emails across N parallel workflows (`asyncio.gather`)
- Automatic judging via simple comparison (verdict vs ground truth)
- Database integration for persisting results to PostgreSQL backend

#### Quick Start (OpenAI Agents SDK Implementation)

```bash
cd openai-agentic

# Install dependencies (from project root)
pip install -r requirements.txt

# Configure API keys (.env file in project root)
# GOOGLE_API_KEY=your_key_here      (for Generator - Gemini)
# ANTHROPIC_API_KEY=your_key_here   (for Detector - Claude)

# Run with defaults (10 emails, 1 round, 2 parallel workflows)
PYTHONPATH=.. python main.py

# Custom configuration
PYTHONPATH=.. python main.py --emails 20 --rounds 3 --workflows 4
```

#### Architecture Example

```python
# Entity-Service pattern with OpenAI Agents SDK
from entities.generator_agent_entity import GeneratorAgentEntity
from services.generator_agent_service import GeneratorAgentService

# Service creates its own entity internally
gen_service = GeneratorAgentService()

# Run agent via OpenAI Agents SDK Runner
result = await gen_service.generate_email()
# result.final_output → JSON string with email content
```

---

## ✨ Key Features

### Two-Agent Competition System (Phase 1 - In Progress)

- **Generator Agent**: Creates synthetic phishing emails for training
- **Detector Agent**: Analyzes emails and identifies threats
- **Dual Orchestration Implementations**:
  - Semantic Kernel with AI function calling (`LLMs/`)
  - OpenAI Agents SDK with LiteLLM multi-model routing (`openai-agentic/`)
- **Multi-Model Architecture**: Gemini 2.0 Flash (generation), Claude 3.5 Haiku (detection), GPT-4o (orchestration in SK)

### Real-Time Monitoring Dashboard (Phase 2 - Planned)

- Live competition round progress tracking
- WebSocket-powered instant updates
- Historical accuracy trend visualization
- Drill-down into individual email analysis
- Manual verdict override capability

### Browser Extension (Phase 3 - Future)

- Real-time email scanning for Gmail, Outlook, etc.
- Risk score overlay on emails
- Privacy-first local pre-filtering
- User consent and data protection

---

## 🏗️ System Architecture

### Three-Agent Architecture

```
┌─────────────────────┐
│ Orchestration Agent │ → AI-powered workflow management
│    (GPT-4o)         │    • Function calling coordination
└──────────┬──────────┘    • Multi-round processing
           │               • Status tracking & metrics
           ▼
┌──────────────────┐       ┌──────────────────┐
│  Generator Agent │       │  Detector Agent  │
│   (GPT-4o)       │       │ (Claude Sonnet)  │
└────────┬─────────┘       └────────┬─────────┘
         │                          │
         ▼                          ▼
   Creates phishing            Multi-layered
   emails with                 threat analysis
   metadata                    & detection

   Entity-Service Architecture:
   ┌─────────┐   Optional    ┌─────────┐
   │ Entity  │◄────Binding──►│ Service │
   │ (State) │               │ (Logic) │
   └─────────┘               └─────────┘
```

### AI-Powered Orchestration

The system uses **Semantic Kernel** for intelligent workflow management:
- Orchestrator AI automatically plans the workflow
- Function calling for agent coordination
- Async/await pattern for efficient API calls
- Safety limits to prevent infinite loops
- Multi-round support with configurable batch sizes

### Competition Round Lifecycle

1. **Initialize**: Configure rounds and emails per round
2. **Generate**: Create synthetic phishing/legitimate emails (Generator Agent)
3. **Detect**: Analyze each email for threat indicators (Detector Agent)
4. **Track**: Record API costs, token usage, and processing time
5. **Store**: Persist results in PostgreSQL (optional, configurable)
6. **Analyze**: Display metrics and insights per round

### Entity-Service Architecture

**Entities** (State Holders):
- API keys, credentials, model identifiers
- API client instances (AsyncOpenAI, AsyncAnthropic, etc.)
- Prompt access via centralized prompts.py
- **Completely independent** - no service dependency

**Services** (Operation Providers):
- Core functionality (generate, detect, orchestrate)
- API calls with error handling
- Cost/performance tracking
- **Dual-mode support**: Bound entity OR entity parameter
- Direct Semantic Kernel registration

### Technology Layers

- **Current**: Semantic Kernel orchestration with multi-model AI
- **Planned**: Flask API with Celery for async processing
- **Planned**: PostgreSQL for persistence, Redis for caching
- **Planned**: React dashboard (real-time updates via WebSocket)
- **Future**: Docker containers for deployment

---

## 🛠️ Technology Stack

### Current Implementation (LLMs — Semantic Kernel)
- **Architecture**: Entity-Service pattern with optional binding
- **Orchestration**: Semantic Kernel with AI function calling
- **AI Models**:
  - OpenAI GPT-4o-mini (generation & orchestration, 128k context)
  - Anthropic Claude Sonnet 4.5 (detection & analysis)
  - Google Gemini 2.5 Flash (judging, optional)
- **Language**: Python 3.11+ with async/await
- **APIs**: OpenAI, Anthropic, Google Generative AI
- **Cost Tracking**: tokencost library for accurate pricing
- **Utilities**: Centralized prompts, API tracking, DB integration

### Current Implementation (openai-agentic — OpenAI Agents SDK)
- **Architecture**: Entity-Service pattern with OpenAI Agents SDK
- **Orchestration**: `agents.Runner` + `asyncio.gather` for parallel workflows
- **Multi-Model Routing**: LiteLLM for provider-agnostic model access
- **AI Models**:
  - Google Gemini 2.0 Flash (generation via `gemini/gemini-2.0-flash`)
  - Anthropic Claude 3.5 Haiku (detection via `anthropic/claude-3-5-haiku-20241022`)
- **Language**: Python 3.11+ with async/await
- **Database**: Shared Flask/SQLAlchemy backend (PostgreSQL)
- **Packages**: `openai-agents>=0.10.0`, `openai-agents[litellm]`, `litellm`

### Backend (Planned - Flask Implementation)
- **Framework**: Flask 3.1.2
- **Task Queue**: Celery 5.6.2 with Redis
- **Database**: PostgreSQL with SQLAlchemy 2.0.46
- **Real-time**: Flask-SocketIO 5.6.0
- **Migrations**: Alembic 1.18.3

### Frontend (Planned)
- **Framework**: React with Next.js or Vite
- **Charts**: Chart.js for analytics
- **WebSocket**: Socket.IO client

### DevOps
- **Containerization**: Docker & Docker Compose (planned)
- **Version Control**: Git/GitHub
- **Testing**: pytest 9.0.2, coverage 7.13.2
- **Code Quality**: black, flake8, pylint, mypy

---

## 🚀 Getting Started

### Quick Start (Current LLMs Implementation)

```bash
# Repository root: dependencies and environment (LLMs/main.py loads ../.env)
pip install -r requirements.txt
cp .env.example .env
# Edit .env — at minimum: OPENAI_API_KEY, ANTHROPIC_API_KEY (GOOGLE_API_KEY optional)

cd LLMs
python main.py

# Interactive prompts:
# Enter number of rounds: 3
# Enter number of emails per round: 5
```

### Example Output

```
🚀 STARTING AI-POWERED MULTI-ROUND ORCHESTRATION
   Rounds: 3
   Emails per round: 5
============================================================

📝 ROUND 1/3
============================================================
   Generating email 1/5...
   ✓ Email 1 generated and analyzed
      Generator status: ✓
      Detector status: ✓
   ...

✅ Round 1 complete: 5 emails generated
   Generator successes: 5/5
   Detector successes: 5/5
   Processing time: 42s
   Total cost: $0.0234500

============================================================
📊 AI ORCHESTRATION COMPLETE
============================================================

📊 Summary:
   Total rounds: 3
   Emails per round: 5
   Total emails generated: 15
```

### Full Stack Setup (Future Flask/React Implementation)

#### Prerequisites

- Python 3.11+
- PostgreSQL 14+
- Redis 7+
- API Keys: OpenAI, Anthropic, Google Gemini

#### Installation

```bash
# Clone the repository
git clone <repository-url>
cd phishing_detection

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies (project root lists Flask, agents, DB drivers, etc.)
pip install -r requirements.txt

# Environment: copy root template and edit (backend/app/config.py loads ../../.env)
cp .env.example .env

# Initialize database (from backend/, with FLASK_APP set — see Flask docs)
cd backend
export FLASK_APP=run.py
flask db upgrade

# Optional: Redis for rate limiting / JWT blocklist (docker compose up -d)
# redis-server

# Run Flask + SocketIO
python run.py
```

#### Configuration

Use a `.env` file at the **repository root** (see root `.env.example`). Key variables:

```env
FLASK_ENV=development
DEV_DATABASE_URL=postgresql://user:password@localhost:5432/phishing_db
REDIS_URL=redis://localhost:6379/0
SECRET_KEY=your_secret_key_here
JWT_SECRET_KEY=your_jwt_secret_here
OPENAI_API_KEY=your_openai_key_here
ANTHROPIC_API_KEY=your_anthropic_key_here
GOOGLE_API_KEY=your_google_key_here
ORCHESTRATION_PARALLEL_WORKFLOWS=2
```

`DATABASE_URL` is optional if `DEV_DATABASE_URL` / `PROD_DATABASE_URL` are set per environment.

---

## 🧠 Multi-Agent System Details

### Scoring System

**Generator Agent (0-100)**
- **Technical Realism** [0-25]: Authenticity of technical details
- **Psychological Impact** [0-25]: Effectiveness of emotional/cognitive manipulation
- **Subtlety Factor** [0-25]: Ability to evade obvious detection patterns
- **Social Engineering** [0-25]: Quality of trust-building and persuasion tactics

**Detector Agent (0-100)**
- **Accuracy** [0-25]: Correct verdict with proper confidence level
- **Analytical Depth** [0-25]: Thoroughness and insight quality
- **Indicator Identification** [0-25]: Found key red flags vs missed indicators
- **Reasoning Quality** [0-25]: Logic, evidence, and argumentation strength

### Heterogeneous Multi-Model Architecture

This system demonstrates a **heterogeneous multi-model approach** across two implementations:

**Semantic Kernel (`LLMs/`)**:
- **OpenAI GPT-4o-mini**: Orchestration and generation (128k context window, cost-effective)
- **Claude Sonnet 4.5**: Advanced detection and analysis (200k context window)
- **Google Gemini 2.5 Flash**: Fast evaluation and judging (optional)

**OpenAI Agents SDK (`openai-agentic/`)**:
- **Google Gemini 2.0 Flash**: Email generation via LiteLLM (`gemini/gemini-2.0-flash`)
- **Anthropic Claude 3.5 Haiku**: Phishing detection via LiteLLM (`anthropic/claude-3-5-haiku-20241022`)
- **No orchestration LLM**: Pure Python async coordination (no LLM cost for orchestration)

Each agent uses a different AI model optimized for its specific task.

### Configuration & Customization

**Architecture Files:**
- **entities/**: Configure API keys, models, and clients
  - `generator_agent_entity.py`: OpenAI configuration
  - `detector_agent_entity.py`: Anthropic configuration
  - `orchestration_agent_entity.py`: Workflow state
- **services/**: Modify business logic and operations
  - `generator_agent_service.py`: Email generation logic
  - `detector_agent_service.py`: Threat detection logic
  - `orchestration_agent_service.py`: Workflow coordination
- **agents/prompts.py**: Centralized prompt templates for all agents
- **utils/**: API tracking, cost calculation, database integration
- **main.py**: Entry point, configure rounds and batch size

---

## 📊 Project Status

### Current Phase: **Phase 1 - Foundation** (Weeks 1-4)

#### ✅ Completed
- Multi-agent system implementation (LLMs directory — Semantic Kernel)
- **OpenAI Agents SDK implementation** (`openai-agentic/` directory):
  - Entity-Service pattern with `agents.Agent` + `LitellmModel`
  - Generator (Gemini 2.0 Flash) and Detector (Claude 3.5 Haiku) agents
  - Parallel workflow orchestration via `asyncio.gather`
  - Automatic judging (no LLM needed — simple verdict comparison)
  - Fixed LiteLLM model routing (`gemini/` and `anthropic/` prefixes)
  - Fixed module imports, async event loop, and email content formatting
  - Verified agents instantiate and connect to external APIs end-to-end
- Generator, Detector, Orchestration agents running and saving results to PostgreSQL via Docker Compose
- Database schema design (Email, Round, Log, API, Override models)
- SQLAlchemy models with proper relationships and constraints
- Flask backend with blueprints, error handlers, and CORS
- Database migrations with Alembic
- Requirements.txt with comprehensive dependencies
- Project architecture documentation

#### 🔄 In Progress
- API key quota renewal (Gemini free tier daily limit + Anthropic key refresh) for full `openai-agentic` end-to-end runs
- Redis caching integration and Dockerization
- Unit testing for backend logic
- Frontend (React) dashboard setup
- Integration of LLMs/openai-agentic agents with Flask backend API
- Celery task orchestration for competition rounds
- Docker containerization

#### ⏳ Upcoming (Phase 1)
- Persistent storage of competition results in PostgreSQL
- Basic React dashboard setup
- Manual round triggering via API
- End-to-end testing
- Documentation and code comments
| **Phase 2**: Dashboard | Weeks 5-8 | ⏳ Planned | Real-time monitoring, WebSocket integration |
| **Phase 3**: User API | Weeks 9-12 | ⏳ Planned | Email scanning endpoint, caching, rate limiting |
| **Phase 4**: Extension | Weeks 13-16 | ⏳ Planned | Chrome extension, Gmail integration |
| **Phase 5+**: Enhancements | Future | 💡 Ideas | Federated learning, custom model fine-tuning |

### Project Structure

```
phishing_detection/
├── LLMs/                         # Semantic Kernel implementation
│   ├── entities/                 # State holders (API keys, clients, config)
│   │   ├── base_entity.py
│   │   ├── generator_agent_entity.py    # OpenAI configuration
│   │   ├── detector_agent_entity.py     # Anthropic configuration
│   │   └── orchestration_agent_entity.py # Workflow state
│   ├── services/                 # Operation providers (business logic)
│   │   ├── base_service.py
│   │   ├── generator_agent_service.py   # Email generation
│   │   ├── detector_agent_service.py    # Threat detection
│   │   └── orchestration_agent_service.py # Workflow coordination
│   ├── utils/                    # Utilities
│   │   ├── api_utils.py          # API tracking, cost calculation
│   │   ├── db_utils.py           # Database integration
│   │   └── prompts.py            # Centralized prompt templates
│   └── main.py                   # Entry point (multi-round orchestration)
├── openai-agentic/               # ✅ OpenAI Agents SDK implementation
│   ├── agents_sdk/               # Direct SDK agent definitions (alt. approach)
│   │   ├── generator.py          # Generator agent factory
│   │   ├── detector.py           # Detector agent factory
│   │   ├── orchestrator.py       # Orchestrator classes
│   │   └── tools.py              # Database tools for agents
│   ├── entities/                 # Agent entities (Agent + LitellmModel config)
│   │   ├── base_entity.py        # Base entity with prompt access
│   │   ├── generator_agent_entity.py  # Gemini 2.0 Flash config
│   │   └── detector_agent_entity.py   # Claude 3.5 Haiku config
│   ├── services/                 # Service wrappers (Runner.run)
│   │   ├── base_service.py
│   │   ├── generator_agent_service.py
│   │   └── detector_agent_service.py
│   ├── utils/                    # Shared utilities
│   │   ├── db_utils.py           # Database integration (Flask backend)
│   │   └── prompts.py            # Centralized prompt templates
│   └── main.py                   # CLI entry point (parallel workflows)
├── backend/                      # ✅ Flask backend
│   ├── app/
│   │   ├── models/               # SQLAlchemy models (Email, Round, Log, API, Override)
│   │   ├── routes/               # Flask API blueprints
│   │   ├── services/             # Business logic
│   │   ├── tasks/                # Celery tasks (planned)
│   │   ├── utils/                # Error handling utilities
│   │   └── config.py             # Dev/Test/Prod configuration
│   └── migrations/               # Alembic database migrations
├── tests/                        # Test suite
├── Documents/                    # 📚 Project documentation
│   ├── Project_Scope.md
│   ├── Implementation_Plan.md
│   ├── Questions.md
│   └── *.excalidraw              # Architecture diagrams
├── requirements.txt              # Python dependencies
├── docker-compose.yml            # Docker services
└── README.md                     # This file
```

---

## 🎯 Use Cases

- **Security Training**: Help teams recognize sophisticated scam patterns and social engineering tactics
- **AI Research**: Study adversarial AI systems and multi-agent competition
- **Educational**: Demonstrate Semantic Kernel orchestration with function calling
- **Testing**: Evaluate email security systems and detection capabilities
- **Multi-Model Integration**: Learn how to integrate different AI providers in a single system
- **Real-time Protection**: Browser extension for individual users (future)
- **Enterprise Security**: Dashboard for security operations teams (future)

---

### Development Phases

| **Phase** | **Timeline** | **Status** | **Key Deliverables** |
|-------|----------|--------|------------------|
| **Phase 1**: Foundation | Weeks 1-4 | 🔄 In Progress | ✅ Multi-agent system, 🔄 database setup |
| **Phase 2**: Dashboard | Weeks 5-8 | ⏳ Planned | Real-time monitoring, WebSocket integration |
| **Phase 3**: User API | Weeks 9-12 | ⏳ Planned | Email scanning endpoint, caching, rate limiting |
| **Phase 4**: Extension | Weeks 13-16 | ⏳ Planned | Chrome extension, Gmail integration |
| **Phase 5+**: Enhancements | Future | 💡 Ideas | Federated learning, custom model fine-tuning |

---

## 👥 Team

- **Hoang Nhat Duy Le** - Project Supervisor / Expert
- **Hoang Bao Duy Le** - Developer / Engineer
- **Thanh Dang Huynh** - Developer / Engineer
- **Thien Quy Pham** - Cybersecurity Analyst / Developer

**Team Structure**: First-time multi-person project with flexible timeline and collaborative learning focus.

---

## 📚 Documentation

- [Project Scope](Documents/Project_Scope.md) - Comprehensive specification and requirements
- [Questions & Decisions](Documents/Questions.md) - Detailed scoping questionnaire with answers
- [Architecture Diagram](Documents/Project_Architecture.excalidraw) - System architecture visualization

### Key Documentation Highlights

#### Threat Detection Scope (Priority Ordered)
1. **Priority 1**: Phishing, malware attachments, social engineering
2. **Priority 2**: Spear phishing, BEC, account takeover
3. **Priority 3**: Spam

#### Data Privacy Approach
- GDPR-compliant principles (student project)
- Encryption at rest (AES-256) and in transit (TLS 1.2+)
- User consent flow for browser extension
- 30-day data retention policy
- Clear privacy policy and ToS

#### Ethical Safeguards
- Generator is internal-only (no public access)
- Watermarking of all synthetic emails
- Admin authentication required
- Rate limiting (10 generations/hour)
- Audit logging for accountability
⚠️ Disclaimer

This system is for **educational and research purposes only**. Do not use generated scam emails for malicious purposes. The Generator Agent is designed to improve detection capabilities and security awareness training only.

---

## 🙏 Acknowledgments

- **OpenPhish & PhishTank**: Public phishing datasets
- **OpenAI**: GPT-4o-mini for generation and orchestration; OpenAI Agents SDK for agentic workflows
- **Anthropic**: Claude Sonnet 4.5 & Claude 3.5 Haiku for advanced detection
- **Google**: Gemini 2.0 Flash & 2.5 Flash for generation and evaluation
- **Microsoft**: Semantic Kernel framework
- **BerriAI**: LiteLLM for multi-model routing
- **Flask Community**: Excellent web framework documentation

### Data Protection
- All sensitive data encrypted at rest and in transit
- API keys stored in environment variables (never committed)
- Database credentials secured via environment configuration
- Session management with secure cookies

### Responsible AI Usage
- Generator model isolated (no external network access)
- Research-only purpose documentation
- Team accountability agreement
- Regular ethical reviews

---

## 📈 Success Metrics & KPIs

### Technical Metrics
- Detection accuracy: Target >85% precision, >80% recall
- False positive rate: <5%
- Processing latency: <5 seconds per email
- System uptime: 99%

### User Metrics (Future)
- User satisfaction score (survey-based)
- Threats successfully blocked
- Alert click-through rate
- Reduction in successful attacks

---

## 🤝 Contributing

This is a student project with a closed team during active development. Post-completion, the repository will be open-sourced on GitHub with contribution guidelines.

---

## 📄 License

To be determined upon project completion.

---

##  Contact

For questions or collaboration inquiries:
- **Email**: [Contact through repository issues]
- **Project Start Date**: January 29, 2025
- **Expected Completion**: April 2025 (MVP)

---

**Status**: 🔄 Active Development | **Last Updated**: March 11, 2026
