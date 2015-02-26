import web
import simplejson as json
import ast

urls = (
	'/', 'gui',
	'/dataset/(.*)', 'dataset',
	'/data/(.*)/(.*)', 'data_request',
)

render = web.template.render('templates')


class gui:
	def GET(self):
		d = {}
		return render.gui(d)


class dataset:
	def GET(self, s, t):
		m = model.Database(s)
		d = {}
		d["database_short"] = s
		d["table"] = t
		d["tables"] = m.get_tables()["tables"]
		return render.table_dynamic(d)

class data_request:
	def GET(self, s, t):
		m = model.Database(s)
		d = m.get_table_instances(t, None)
		return json.dumps(d, cls=DateEncoder);

class data_request2:
	def POST(self, s, t):
		m = model.Database(s)
		data = web.data()
		data = ast.literal_eval(data)
		d = m.get_table_instances(t, data)
		return json.dumps(d);


if __name__ == "__main__":
	app = web.application(urls, globals())
	app.internalerror = web.debugerror
	app.run()