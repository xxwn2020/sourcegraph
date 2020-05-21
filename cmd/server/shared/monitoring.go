package shared

import "os"

const prometheusProcLine = `prometheus: prometheus --config.file=/sg_config_prometheus/prometheus.yml --web.enable-admin-api --storage.tsdb.path=/var/opt/sourcegraph/prometheus --web.console.libraries=/usr/share/prometheus/console_libraries --web.console.templates=/usr/share/prometheus/consoles >> /var/opt/sourcegraph/prometheus.log 2>&1`

const grafanaProcLine = `grafana: /usr/share/grafana/bin/grafana-server -config /sg_config_grafana/grafana-single-container.ini -homepath /usr/share/grafana >> /var/opt/sourcegraph/grafana.log 2>&1`

const jagerProcLine = `jaeger --memory.max-traces=20000 >> /var/opt/sourcegraph/jaeger.log 2>&1`

func maybeMonitoring() ([]string, error) {
	if os.Getenv("DISABLE_MONITORING") == "" {
		return []string{""}, nil
	}
	return []string{
		prometheusProcLine,
		grafanaProcLine,
		jagerProcLine}, nil
}
