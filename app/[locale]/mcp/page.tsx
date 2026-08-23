import { notFound } from "next/navigation"

import {
  ButtonLink,
  Eyebrow,
  Lead,
  PageHeader,
  SectionStack,
  Surface
} from "@/components/design-system"
import { getDictionary } from "@/data/i18n"
import type { LocaleDictionary } from "@/data/i18n/types"
import {
  MCP_DISCOVERY_EXAMPLE,
  PROBLEM_EXAMPLE,
  PUBLIC_API_ENDPOINTS,
  REST_EXAMPLES
} from "@/lib/api-docs"
import { isLocale } from "@/lib/i18n"
import { buildPageTitle, createMetadata } from "@/lib/metadata"
import { MCP_ENDPOINT_URL, MCP_SERVER_NAME, SITE_URL } from "@/lib/site"

type McpPageCopy = LocaleDictionary["pages"]["mcp"]

const connectionConfig = JSON.stringify(
  { mcpServers: { [MCP_SERVER_NAME]: { url: MCP_ENDPOINT_URL } } },
  null,
  2
)

function CodeBlocks({ items, label }: { items: readonly string[]; label: string }) {
  return items.map((item) => (
    <pre key={item} aria-label={label}>
      <code>{item}</code>
    </pre>
  ))
}

function ApiSection({ page }: { page: McpPageCopy }) {
  return (
    <Surface aria-labelledby="public-api-title">
      <h2 id="public-api-title">{page.apiHeading}</h2>
      <p>{page.apiDescription}</p>
      <p>{page.authenticationDescription}</p>
      <p>
        <code>{`${SITE_URL}/openapi.json`}</code>
      </p>
      <ButtonLink href="/openapi.json">{page.openApiLabel}</ButtonLink>
      <h3>{page.endpointsHeading}</h3>
      <ul className="markdown content-prose">
        {PUBLIC_API_ENDPOINTS.map((endpoint) => (
          <li key={endpoint}>
            <code>{endpoint}</code>
          </li>
        ))}
      </ul>
      <div className="markdown content-prose">
        <h3>{page.apiExamplesHeading}</h3>
        <CodeBlocks items={REST_EXAMPLES} label={page.apiExamplesHeading} />
        <h3>{page.errorsHeading}</h3>
        <p>{page.errorsDescription}</p>
        <pre aria-label={page.errorsHeading}>
          <code>{PROBLEM_EXAMPLE}</code>
        </pre>
      </div>
    </Surface>
  )
}

function EndpointSection({ page }: { page: McpPageCopy }) {
  return (
    <Surface aria-labelledby="mcp-endpoint-title">
      <h2 id="mcp-endpoint-title">{page.endpointHeading}</h2>
      <p>{page.endpointDescription}</p>
      <div className="markdown content-prose">
        <p>
          <code>{MCP_ENDPOINT_URL}</code>
        </p>
        <h3>{page.configurationLabel}</h3>
        <pre aria-label={page.configurationLabel}>
          <code>{connectionConfig}</code>
        </pre>
        <h3>{page.discoveryLabel}</h3>
        <pre aria-label={page.discoveryLabel}>
          <code>{MCP_DISCOVERY_EXAMPLE}</code>
        </pre>
      </div>
    </Surface>
  )
}

function ToolsSection({ page }: { page: McpPageCopy }) {
  return (
    <Surface aria-labelledby="mcp-tools-title">
      <h2 id="mcp-tools-title">{page.toolsHeading}</h2>
      <dl className="markdown content-prose">
        {page.tools.map((tool) => (
          <div key={tool.name}>
            <dt>
              <code>{tool.name}</code>
            </dt>
            <dd>{tool.description}</dd>
          </div>
        ))}
      </dl>
      <p>{page.capabilitiesNote}</p>
    </Surface>
  )
}

function ListSection({ id, heading, items }: { id: string; heading: string; items: string[] }) {
  return (
    <Surface aria-labelledby={id}>
      <h2 id={id}>{heading}</h2>
      <ul className="markdown content-prose">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </Surface>
  )
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const page = getDictionary(locale).pages.mcp

  return createMetadata(locale, {
    title: buildPageTitle(page.metadataTitle),
    description: page.metadataDescription,
    path: "/mcp"
  })
}

export default async function McpPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const dictionary = getDictionary(locale)
  const page = dictionary.pages.mcp

  return (
    <SectionStack as="div">
      <Surface aria-labelledby="mcp-title">
        <PageHeader>
          <Eyebrow>{page.eyebrow}</Eyebrow>
          <h1 id="mcp-title">{page.metadataTitle}</h1>
          <Lead>{page.lead}</Lead>
        </PageHeader>
      </Surface>
      <ApiSection page={page} />
      <EndpointSection page={page} />
      <ToolsSection page={page} />
      <ListSection id="mcp-examples-title" heading={page.examplesHeading} items={page.examples} />
      <ListSection
        id="mcp-boundaries-title"
        heading={page.boundariesHeading}
        items={page.boundaries}
      />
      <div className="hero-actions">
        <ButtonLink href={`/${locale}/contact`}>{page.contactLabel}</ButtonLink>
        <ButtonLink variant="secondary" href={`/${locale}/privacy`}>
          {dictionary.pages.privacy.metadataTitle}
        </ButtonLink>
      </div>
    </SectionStack>
  )
}
