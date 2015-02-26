import web
import simplejson as json
import ast
import csv

urls = (
	'/', 'gui',
	'/data/(.*)', 'data_request',
	'/(.*)', 'dataset',
)

render = web.template.render('templates')


class gui:
	def GET(self):
		d = {"dataset": "LesMis"}
		return render.gui(d)

class dataset:
	def GET(self, name):
		d = {}
		d["dataset"] = name
		return render.gui(d)

class data_request:
	def GET(self, id):
		d = {}
		nodes = []
		edges = []
		nodes.append( ["id", "label", "modularity_class"] )
		edges.append( ["source", "target", "type", "id", "label", "weight"] )
		
		with open("./static/data/dynamic/nodes.csv", "wb") as f:
			writer = csv.writer(f, delimiter=',')
			writer.writerows(nodes)
		with open("./static/data/dynamic/edges.csv", "wb") as f:
			writer = csv.writer(f, delimiter=',')
			writer.writerows(edges)
		
		d["dataset"] = "dynamic"
		return render.gui(d)

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