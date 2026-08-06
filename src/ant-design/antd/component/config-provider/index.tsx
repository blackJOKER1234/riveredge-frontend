import type { Token } from "../../../core";
import useLocale from "../../../locales/useLocale";
import { syncDayjsLocale } from "../../../locales/antd-locale";
import { StyleProvider } from "@ant-design/cssinjs";
import { ConfigProvider as RawConfigProvider, theme } from "antd";
import { ThemeProvider } from "antd-style";
import { type ReactNode, useEffect, useMemo } from "react";
import { buildAntdThemeConfig } from "./theme";

import "antd/dist/antd.css";
import "../../../locales/i18n";
import { Empty } from "../../../antd";
import useTheme from "../../../core/hook/use-theme";

interface Props {
  children: ReactNode;
}

interface RedcoastToken {
  redcoast: Token;
}

function ConfigProvider({ children }: Props) {
  const redcoastToken = useTheme();

  const antdToken = useMemo(
    () => buildAntdThemeConfig(redcoastToken),
    [redcoastToken],
  );

  const algorithm = useMemo(
    () => (redcoastToken.colorWhite === "#FFFFFF" ? theme.defaultAlgorithm : theme.darkAlgorithm),
    [redcoastToken.colorWhite],
  );

  const { language } = useLocale();

  useEffect(() => {
    syncDayjsLocale(language.dayjsLocale);
  }, [language.dayjsLocale]);

  return (
    <RawConfigProvider
      locale={language.antdLocal}
      renderEmpty={() => <Empty />}
      drawer={{
        closeIcon: null,
        style: {
          borderTopLeftRadius: redcoastToken.borderRadiusLG,
          borderBottomLeftRadius: redcoastToken.borderRadiusLG,
          boxShadow: " -8px 0px 16px rgba(0, 0, 0, 0.04)",
        },
        styles: {
          header: {
            margin: 44,
            marginBottom: 0,
            padding: 0,
            paddingBottom: 16,
            fontWeight: 700,
            fontSize: 16,
            lineHeight: 20,
            borderColor: redcoastToken.colorSplitLine,
          },
          body: {
            padding: "24px  44px 0 44px",
          },
          footer: {
            margin: 44,
            marginTop: 0,
            padding: 0,
            paddingTop: 16,
          },
        },
      }}
    >
      <ThemeProvider<Token>
        theme={{
          token: antdToken.token as any,
          components: antdToken.components as any,
          cssVar: {},
          hashed: false,
          algorithm: algorithm as any,
        } as any}
        customToken={redcoastToken}
      >
        <StyleProvider>{children}</StyleProvider>
      </ThemeProvider>
    </RawConfigProvider>
  );
}

export default ConfigProvider;
export type { RedcoastToken };
